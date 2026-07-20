import { Request, Response } from "express";
import fs from "fs";
import { ImportPortfolioService } from "../application/services/ImportPortfolioService";
import type { MulterRequest } from "../models/MulterRequest";
import { ExportPortfolioService } from "../application/services/ExportPortfolioService";
import { CreateOrUpdatePortfolioService } from "../application/services/CreateOrUpdatePortfolioService";
import { DeletePortfolioService } from "../application/services/DeletePortfolioService";
import { ListPortfolioService } from "../application/services/ListPortfolioService";
import { SpreadsheetParserService } from "../infrastructure/services/SpreadsheetParserService";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";

const XLSX_MAGIC = [0x50, 0x4b, 0x03, 0x04];

export class PortfolioController {
  constructor(
    private createOrUpdatePortfolioService: CreateOrUpdatePortfolioService,
    private deletePortfolioService: DeletePortfolioService,
    private listPortfolioService: ListPortfolioService,
    private exportPortfolioService: ExportPortfolioService,
    private importPortfolioService: ImportPortfolioService,
    private spreadsheetParser: SpreadsheetParserService
  ) { }

  async createOrUpdateAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.createOrUpdatePortfolioService.executeAsync({
        codigo: String(req.body?.codigo ?? ""),
        quantidade: Number(req.body?.quantidade),
        precoMedio: Number(req.body?.precoMedio),
      });
      return res.status(result.created ? 201 : 200).json(result.portfolio);
    } catch (error) {
      return ErrorHandler.handle(error as Error, res);
    }
  }

  async deleteAsync(req: Request, res: Response): Promise<Response> {
    try {
      const id = String(req.params.id);
      await this.deletePortfolioService.executeAsync(id);
      return res.json({ message: "Ativo do portfólio deletado com sucesso." });
    } catch (error) {
      return ErrorHandler.handle(error as Error, res);
    }
  }

  async listAsync(_req: Request, res: Response): Promise<Response> {
    try {
      const portfolios = await this.listPortfolioService.executeAsync();
      return res.json(portfolios);
    } catch (error) {
      return ErrorHandler.handle(error as Error, res);
    }
  }

  async exportPortfolioAsync(_req: Request, res: Response): Promise<Response> {
    try {
      const { buffer, fileName } = await this.exportPortfolioService.executeAsync();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      return ErrorHandler.handle(error as Error, res);
    }
  }

  async importPortfolioAsync(req: Request, res: Response): Promise<Response> {
    const file = (req as MulterRequest).file;

    if (!file) {
      return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
    }

    try {
      const buffer = fs.readFileSync(file.path);
      if (buffer.length < 4 || !XLSX_MAGIC.every((byte, indice) => buffer[indice] === byte)) {
        return res.status(400).json({ message: "Tipo de arquivo inválido. Envie um arquivo .xlsx válido." });
      }

      const rows = this.spreadsheetParser.parsePortfolioRowsAsync(buffer);

      if (!rows.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const importedCount = await this.importPortfolioService.executeAsync(rows);
      return res.status(201).json({ imported: importedCount });
    } catch (error) {
      const err = error as Error;
      return res.status(400).json({
        message: "Erro ao importar planilha de portfólio",
        error: err.message,
      });
    } finally {
      if (file.path) fs.unlink(file.path, () => {});
    }
  }
}
