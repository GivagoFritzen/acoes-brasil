import fs from "fs";
import os from "os";
import path from "path";
import { Request, Response } from "express";
import { ImportOrdersService } from "../application/services/ImportOrdersService";
import { SpreadsheetParserService } from "../infrastructure/services/SpreadsheetParserService";
import type { MulterRequest } from "../models/MulterRequest";
import { createMulterUpload } from "../shared/multer/MulterConfigFactory";
import { XLSX_MAGIC_BYTES } from "../shared/constants/ProjectConstants";

let uploadDir: string | null = null;
let upload: ReturnType<typeof createMulterUpload> | null = null;

const getUpload = () => {
  if (!uploadDir) {
    uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "acoes-upload-"));
    upload = createMulterUpload(uploadDir);
  }
  return upload!;
};

export class ImportController {
  constructor(
    private importOrdersService: ImportOrdersService,
    private spreadsheetParser: SpreadsheetParserService
  ) { }

  public getMiddleware() {
    return getUpload().single("file");
  }

  public async importAsync(req: Request, res: Response) {
    const file = (req as MulterRequest).file;

    if (!file) {
      return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
    }

    try {
      const buffer = await fs.promises.readFile(file.path);
      if (buffer.length < 4 || !XLSX_MAGIC_BYTES.every((byte, indice) => buffer[indice] === byte)) {
        return res.status(400).json({ message: "Tipo de arquivo inválido. Envie um arquivo .xlsx válido." });
      }
      const ordersToImport = this.spreadsheetParser.parseOrderRowsAsync(buffer);

      if (!ordersToImport.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const confirmado = req.query?.confirmado === 'true';

      if (!confirmado) {
        const validation = await this.importOrdersService.validateAsync(ordersToImport);
        if (validation.hasDivergences) {
          return res.status(200).json({
            divergencias: validation.divergences,
            mensagem: "Existem divergências que precisam ser confirmadas.",
          });
        }
      }

      const result = await this.importOrdersService.executeAsync(ordersToImport, true);
      return res.status(201).json(result);
    } catch (error) {
      console.error("[ImportController]", error);
      return res.status(400).json({
        message: error instanceof Error ? error.message : "Erro ao importar planilha de negociação",
      });
    } finally {
      if (file.path) await fs.promises.unlink(file.path).catch(() => {});
    }
  }
}
