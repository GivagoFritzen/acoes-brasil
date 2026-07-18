import fs from "fs";
import os from "os";
import path from "path";
import multer from "multer";
import { Request, Response } from "express";
import { ImportOrdersService } from "../application/services/ImportOrdersService";
import { SpreadsheetParserService } from "../infrastructure/services/SpreadsheetParserService";
import { Container } from "../shared/dependency-injection/Container";

type MulterRequest = Request & { file?: Express.Multer.File };

const XLSX_MAGIC = [0x50, 0x4b, 0x03, 0x04];
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "acoes-upload-"));
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 1048576 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".xlsx") {
      return cb(new Error("Apenas arquivos .xlsx são permitidos."));
    }
    cb(null, true);
  },
});

export class ImportController {
  private ImportOrdersService: ImportOrdersService;
  private spreadsheetParser: SpreadsheetParserService;

  constructor() {
    this.ImportOrdersService = Container.get('ImportOrdersService');
    this.spreadsheetParser = Container.get('spreadsheetParser');
  }

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
      if (buffer.length < 4 || !XLSX_MAGIC.every((b, i) => buffer[i] === b)) {
        return res.status(400).json({ message: "Tipo de arquivo inválido. Envie um arquivo .xlsx válido." });
      }
      const ordersToImport = this.spreadsheetParser.parseOrderRowsAsync(buffer);

      if (!ordersToImport.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const importedCount = await this.ImportOrdersService.executeAsync(ordersToImport);
      return res.status(201).json({ imported: importedCount });
    } catch (error) {
      const err = error as Error;
      return res.status(400).json({
        message: "Erro ao importar planilha de negociação",
        error: err.message,
      });
    } finally {
      if (file.path) fs.unlink(file.path, () => {});
    }
  }
}
