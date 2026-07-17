import fs from "fs";
import { Request, Response } from "express";
import type { ProventoTipo as proventoTipo } from "../../../common/models/provento";
import { CreateProventoService } from "../application/services/CreateProventoService";
import { DeleteProventoService } from "../application/services/DeleteProventoService";
import { ImportProventosService } from "../application/services/ImportProventosService";
import { ListProventosService } from "../application/services/ListProventosService";
import { SpreadsheetParserService } from "../infrastructure/services/SpreadsheetParserService";
import { Container } from "../shared/dependency-injection/Container";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";
import { isValidUuid } from "../shared/validators/IdValidator";

export class ProventoController {
  private createProventoService: CreateProventoService;
  private deleteProventoService: DeleteProventoService;
  private importProventosService: ImportProventosService;
  private listProventosService: ListProventosService;
  private spreadsheetParserService: SpreadsheetParserService;

  constructor() {
    this.createProventoService = Container.get("CreateProventoService");
    this.deleteProventoService = Container.get("DeleteProventoService");
    this.importProventosService = Container.get("ImportProventosService");
    this.listProventosService = Container.get("ListProventosService");
    this.spreadsheetParserService = Container.get("spreadsheetParser");
  }

  async createAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.createProventoService.executeAsync({
        codigo: String(req.body?.codigo ?? ""),
        data: String(req.body?.data ?? ""),
        tipo: req.body?.tipo as proventoTipo,
        instituicao: String(req.body?.instituicao ?? ""),
        quantidade: Number(req.body?.quantidade),
        precoUnitario: Number(req.body?.precoUnitario),
        valorLiquido: Number(req.body?.valorLiquido),
      });
      return res.status(201).json(result);
    } catch (error) {
      return ErrorHandler.handle(error, res);
    }
  }

  async deleteAsync(req: Request, res: Response): Promise<Response> {
    try {
      const id = String(req.params.id);
      if (!isValidUuid(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }
      await this.deleteProventoService.executeAsync(id);
      return res.json({ message: "provento deletado com sucesso." });
    } catch (error) {
      return ErrorHandler.handle(error, res);
    }
  }

  async importAsync(req: Request, res: Response): Promise<Response> {
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
    }

    try {
      const buffer = fs.readFileSync(file.path);
      const { validRows, invalidLineNumbers } = this.spreadsheetParserService.parseProventoRowsAsync(buffer);

      if (!validRows.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const result = await this.importProventosService.executeAsync(validRows);
      return res.status(201).json({ ...result, invalidLineNumbers });
    } catch (error) {
      return ErrorHandler.handle(error, res);
    } finally {
      if (file?.path) fs.unlink(file.path, () => {});
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
      return ErrorHandler.handle(error, res);
    }
  }
}
