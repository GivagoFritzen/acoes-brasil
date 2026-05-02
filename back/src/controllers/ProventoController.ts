import { Request, Response } from "express";
import type { ProventoTipo } from "../../../common/models/provento";
import { CreateProventoService } from "../application/services/CreateProventoService";
import { DeleteProventoService } from "../application/services/DeleteProventoService";
import { ImportProventosService } from "../application/services/ImportProventosService";
import { ListProventosService } from "../application/services/ListProventosService";
import { SpreadsheetParserService } from "../infrastructure/services/SpreadsheetParserService";
import { Container } from "../shared/dependency-injection/Container";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";

export class ProventoController {
  private createProventoService: CreateProventoService;
  private deleteProventoService: DeleteProventoService;
  private importProventosService: ImportProventosService;
  private listProventosService: ListProventosService;
  private spreadsheetParserService: SpreadsheetParserService;

  constructor() {
    this.createProventoService = Container.get("createProventoService");
    this.deleteProventoService = Container.get("deleteProventoService");
    this.importProventosService = Container.get("importProventosService");
    this.listProventosService = Container.get("listProventosService");
    this.spreadsheetParserService = Container.get("spreadsheetParser");
  }

  async createAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.createProventoService.executeAsync({
        codigo: String(req.body?.codigo ?? ""),
        data: String(req.body?.data ?? ""),
        tipo: req.body?.tipo as ProventoTipo,
        instituicao: String(req.body?.instituicao ?? ""),
        quantidade: Number(req.body?.quantidade),
        precoUnitario: Number(req.body?.precoUnitario),
        valorLiquido: Number(req.body?.valorLiquido),
      });
      return res.status(201).json(result);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async deleteAsync(req: Request, res: Response): Promise<Response> {
    try {
      await this.deleteProventoService.executeAsync(String(req.params.id));
      return res.json({ message: "Provento deletado com sucesso." });
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async importAsync(req: Request, res: Response): Promise<Response> {
    const file = (req as any).file as { buffer?: Buffer } | undefined;

    if (!file?.buffer) {
      return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
    }

    try {
      const { validRows, invalidLineNumbers } = this.spreadsheetParserService.parseProventoRowsAsync(file.buffer);

      if (!validRows.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const result = await this.importProventosService.executeAsync(validRows);
      return res.status(201).json({ ...result, invalidLineNumbers });
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async listAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.listProventosService.executeAsync({
        codigo: typeof req.query.codigo === "string" ? req.query.codigo : undefined,
        tipo: typeof req.query.tipo === "string" ? req.query.tipo : undefined,
        data: typeof req.query.data === "string" ? req.query.data : undefined,
        dataInicial: typeof req.query.dataInicial === "string" ? req.query.dataInicial : undefined,
        dataFinal: typeof req.query.dataFinal === "string" ? req.query.dataFinal : undefined,
        agruparPorCodigo: String(req.query.agruparPorCodigo ?? "").trim().toLowerCase() === "true",
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });
      return res.json(result);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }
}
