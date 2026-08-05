import fs from "fs";
import os from "os";
import path from "path";
import { Request, Response } from "express";
import { ImportOrdersService } from "../application/services/ImportOrdersService";
import { SpreadsheetParserService } from "../infrastructure/services/SpreadsheetParserService";
import type { MulterRequest } from "../models/MulterRequest";
import { createMulterUpload } from "../shared/multer/MulterConfigFactory";

const XLSX_MAGIC = [0x50, 0x4b, 0x03, 0x04];
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "acoes-upload-"));
const upload = createMulterUpload(uploadDir);

export class ImportController {
  constructor(
    private importOrdersService: ImportOrdersService,
    private spreadsheetParser: SpreadsheetParserService
  ) { }

  public getMiddleware() {
    return upload.single("file");
  }

  public async importAsync(req: Request, res: Response) {
    const file = (req as MulterRequest).file;

    if (!file) {
      return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
    }

    try {
      const buffer = fs.readFileSync(file.path);
      if (buffer.length < 4 || !XLSX_MAGIC.every((byte, indice) => buffer[indice] === byte)) {
        return res.status(400).json({ message: "Tipo de arquivo inválido. Envie um arquivo .xlsx válido." });
      }
      const ordersToImport = this.spreadsheetParser.parseOrderRowsAsync(buffer);

      if (!ordersToImport.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const importedCount = await this.importOrdersService.executeAsync(ordersToImport);
      return res.status(201).json({ imported: importedCount });
    } catch (error) {
      return res.status(400).json({
        message: "Erro ao importar planilha de negociação",
      });
    } finally {
      if (file.path) await fs.promises.unlink(file.path).catch(() => {});
    }
  }
}
