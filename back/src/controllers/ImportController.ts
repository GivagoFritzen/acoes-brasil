import multer from "multer";
import { Request, Response } from "express";
import { ImportOrdersUseCase } from "../application/use-cases/ImportOrdersUseCase";
import { SpreadsheetParserService } from "../infrastructure/services/SpreadsheetParserService";
import { Container } from "../shared/dependency-injection/Container";

const upload = multer({ storage: multer.memoryStorage() });

export class ImportController {
  private importOrdersUseCase: ImportOrdersUseCase;
  private spreadsheetParser: SpreadsheetParserService;

  constructor() {
    this.importOrdersUseCase = Container.get('importOrdersUseCase');
    this.spreadsheetParser = Container.get('spreadsheetParser');
  }

  public getMiddleware() {
    return upload.single("file");
  }

  public async importAsync(req: Request, res: Response) {
    const file = (req as any).file as { buffer?: Buffer } | undefined;

    if (!file?.buffer) {
      return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
    }

    try {
      const ordersToImport = this.spreadsheetParser.parseOrderRowsAsync(file.buffer);

      if (!ordersToImport.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const importedCount = await this.importOrdersUseCase.executeAsync(ordersToImport);
      return res.status(201).json({ imported: importedCount });
    } catch (error: any) {
      return res.status(400).json({
        message: "Erro ao importar planilha de negociação",
        error: error.message || error,
      });
    }
  }
}
