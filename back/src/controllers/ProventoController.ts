import { Request, Response } from "express";
import type { ProventoTipo } from "../../../common/models/provento";
import { extractField, parseDecimal, readSpreadsheetRows, SpreadsheetRow, toBrDateString } from "../utils/spreadsheet";
import { CreateProventoUseCase } from "../application/use-cases/CreateProventoUseCase";
import { DeleteProventoUseCase } from "../application/use-cases/DeleteProventoUseCase";
import { ImportProventosUseCase } from "../application/use-cases/ImportProventosUseCase";
import { ListProventosUseCase } from "../application/use-cases/ListProventosUseCase";
import { CreateProventoDto } from "../application/dto/CreateProventoDto";
import { Container } from "../shared/dependency-injection/Container";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";

export class ProventoController {
  private createProventoUseCase: CreateProventoUseCase;
  private deleteProventoUseCase: DeleteProventoUseCase;
  private importProventosUseCase: ImportProventosUseCase;
  private listProventosUseCase: ListProventosUseCase;

  constructor() {
    this.createProventoUseCase = Container.get("createProventoUseCase");
    this.deleteProventoUseCase = Container.get("deleteProventoUseCase");
    this.importProventosUseCase = Container.get("importProventosUseCase");
    this.listProventosUseCase = Container.get("listProventosUseCase");
  }

  async createAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.createProventoUseCase.executeAsync({
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
      await this.deleteProventoUseCase.executeAsync(String(req.params.id));
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
      const rows = readSpreadsheetRows(file.buffer);

      if (!rows.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const linhas: CreateProventoDto[] = [];

      for (const row of rows) {
        if (this.isRowEmpty(row)) {
          continue;
        }

        const produtoField = extractField(row, ["Produto", "Código", "Codigo"]);
        const pagamentoField = extractField(row, ["Pagamento", "Data", "Data de Pagamento"]);
        const tipoField = extractField(row, ["Tipo de Evento", "Tipo"]);
        const instituicaoField = extractField(row, ["Instituição", "Instituicao"]);
        const quantidadeField = extractField(row, ["Quantidade"]);
        const precoField = extractField(row, ["Preço unitário", "Preco unitario", "Preço", "Preco"]);
        const valorField = extractField(row, ["Valor líquido", "Valor liquido", "Valor"]);

        const seemsHeaderRow =
          this.isHeaderCell(produtoField, ["Produto", "Código", "Codigo"]) ||
          this.isHeaderCell(tipoField, ["Tipo de Evento", "Tipo"]);

        if (seemsHeaderRow) {
          continue;
        }

        const hasAnyMainField = [produtoField, pagamentoField, tipoField, instituicaoField, quantidadeField, precoField, valorField]
          .some((value) => String(value ?? "").trim() !== "");

        if (!hasAnyMainField) {
          continue;
        }

        const codigo = this.normalizeCodigoFromProduto(produtoField);
        const data = toBrDateString(pagamentoField) ?? "";
        const tipo = this.normalizeTipoProvento(tipoField);
        const instituicao = String(instituicaoField ?? "").trim();
        const quantidadeRaw = parseDecimal(quantidadeField);
        const precoUnitario = parseDecimal(precoField) ?? 0;
        const valorLiquido = parseDecimal(valorField) ?? 0;
        const quantidade = quantidadeRaw === null ? 0 : Math.trunc(quantidadeRaw);

        linhas.push({ codigo, data, tipo, instituicao, quantidade, precoUnitario, valorLiquido });
      }

      const result = await this.importProventosUseCase.executeAsync(linhas);
      return res.status(201).json(result);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async listAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.listProventosUseCase.executeAsync({
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

  private normalizeTipoProvento(value: unknown): ProventoTipo {
    const raw = this.normalizeText(value);
    if (raw.includes("divid")) return "Dividendo";
    if (raw.includes("juros") || raw.includes("jscp") || raw.includes("capital proprio")) return "JurosSobreCapitalProprio";
    return "Rendimento";
  }

  private isHeaderCell(value: unknown, headers: string[]): boolean {
    const normalizedValue = this.normalizeText(value);
    if (!normalizedValue) return false;
    return headers.some((header) => this.normalizeText(header) === normalizedValue);
  }

  private isRowEmpty(row: SpreadsheetRow): boolean {
    const values = Object.values(row);
    if (!values.length) return true;
    return values.every((value) => value === null || value === undefined || String(value).trim() === "");
  }

  private normalizeCodigoFromProduto(value: unknown): string {
    const raw = String(value ?? "").trim().toUpperCase();
    if (!raw) return "";
    const codigoMatch = raw.match(/[A-Z]{4}\d{2}F?/);
    if (codigoMatch) {
      return String(codigoMatch[0]).trim().toUpperCase().replace(/\s+/g, "");
    }
    return String((raw.split(/\s|-|\//)[0] ?? raw)).trim().toUpperCase().replace(/\s+/g, "");
  }

  private normalizeText(value: unknown): string {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase();
  }
}
