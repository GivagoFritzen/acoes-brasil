import type { SpreadsheetRow } from "../../models/SpreadsheetRow";
import { extractField, readSpreadsheetRows, toBrDateString } from "../../utils/Spreadsheet";
import type { ProventoTipo as proventoTipo } from "../../../../common/models/provento";
import { CreateOrderDto } from "../../application/dto/CreateOrderDto";
import { CreateProventoDto } from "../../application/dto/CreateProventoDto";
import { PortfolioImportRowDto } from "../../application/dto/PortfolioImportRowDto";
import type { OrderOperacao as orderOperacao } from "../../../../common/models/order";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { detectSupportedAssetTypeFromTicker } from "../../../../common/utils/AssetTypeUtils";
import { ParseProventoResult } from "../../models/ParseProventoResult";
import { DateUtils } from "../../shared/utils/DateUtils";
import { parseDecimal } from "../../../../common/utils/parseDecimal";

export class SpreadsheetParserService {
  parseOrderRowsAsync(buffer: Buffer): CreateOrderDto[] {
    const rows = readSpreadsheetRows(buffer);

    if (!rows.length) {
      return [];
    }

    const ordersToImport: CreateOrderDto[] = [];

    for (const [index, row] of rows.entries()) {
      const line = index + 2;
      const codigo = normalizeOrderCodigo(
        String(extractField(row, ["Código de Negociação", "Codigo de Negociacao", "Código", "Codigo"]) ?? "")
      );
      const quantidadeRaw = parseDecimal(extractField(row, ["Quantidade"]));
      const preco = parseDecimal(extractField(row, ["Preço", "Preco"]));
      const brData = toBrDateString(extractField(row, ["Data do Negócio", "Data do Negocio", "Data"]));
      const data = brData ? DateUtils.normalizeToIsoDate(brData) ?? brData : "";
      const operacao = this.normalizeOperacao(extractField(row, ["Tipo de Movimentação", "Tipo de Movimentacao"]));
      const tipo = detectSupportedAssetTypeFromTicker(codigo);
      const quantidade = quantidadeRaw === null ? null : Math.trunc(quantidadeRaw);

      if (!codigo || !quantidade || !preco || !data || !operacao || !tipo) {
        throw new Error(`Linha ${line}: dados obrigatórios inválidos para importação de negociação.`);
      }

      ordersToImport.push({ codigo, quantidade, valor: preco, data, tipo, operacao });
    }

    return ordersToImport;
  }

  parseProventoRowsAsync(buffer: Buffer): ParseProventoResult {
    const rows = readSpreadsheetRows(buffer);
    const validRows: CreateProventoDto[] = [];
    const invalidLineNumbers: number[] = [];

    for (const [index, row] of rows.entries()) {
      const lineNumber = index + 1;

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

      if (this.isHeaderRow(produtoField, tipoField)) {
        continue;
      }

      if (!this.hasAnyMainField(
        produtoField,
        pagamentoField,
        tipoField,
        instituicaoField,
        quantidadeField,
        precoField,
        valorField
      )) {
        invalidLineNumbers.push(lineNumber);
        continue;
      }

      validRows.push(
        this.parseProventoRowFields(
          produtoField,
          pagamentoField,
          tipoField,
          instituicaoField,
          quantidadeField,
          precoField,
          valorField
        )
      );
    }

    return { validRows, invalidLineNumbers };
  }

  parsePortfolioRowsAsync(buffer: Buffer): PortfolioImportRowDto[] {
    const rows = readSpreadsheetRows(buffer);
    const portfolios: PortfolioImportRowDto[] = [];

    for (const [index, row] of rows.entries()) {
      const line = index + 2;
      const codigo = normalizeOrderCodigo(
        String(extractField(row, ["Código", "Codigo", "Ativo"]) ?? "")
      );
      const quantidadeRaw = parseDecimal(extractField(row, ["Quantidade"]));
      const precoMedio = parseDecimal(extractField(row, ["Preço Médio", "Preco Medio", "PrecoMedio", "Preço", "Preco"]));

      const quantidade = quantidadeRaw === null ? null : Math.trunc(quantidadeRaw);

      if (!codigo || !quantidade || quantidade <= 0 || !precoMedio) {
        throw new Error(`Linha ${line}: dados obrigatórios inválidos para importação de portfólio.`);
      }

      portfolios.push({ codigo, quantidade, precoMedio });
    }

    return portfolios;
  }

  private parseProventoRowFields(
    produtoField: string | undefined,
    pagamentoField: string | undefined,
    tipoField: string | undefined,
    instituicaoField: string | undefined,
    quantidadeField: string | undefined,
    precoField: string | undefined,
    valorField: string | undefined
  ): CreateProventoDto {
    const codigo = this.normalizeCodigoFromProduto(produtoField);
    const brData = toBrDateString(pagamentoField);
    const data = brData ? DateUtils.normalizeToIsoDate(brData) ?? brData : "";
    const tipo = this.normalizeTipoProvento(tipoField);
    const instituicao = String(instituicaoField ?? "").trim();
    const quantidadeRaw = parseDecimal(quantidadeField);
    const precoUnitario = parseDecimal(precoField) ?? 0;
    const valorLiquido = parseDecimal(valorField) ?? 0;
    const quantidade = quantidadeRaw === null ? 0 : Math.trunc(quantidadeRaw);

    return {
      codigo,
      data,
      tipo,
      instituicao,
      quantidade,
      precoUnitario,
      valorLiquido,
    };
  }

  private isHeaderRow(
    produtoField: string | undefined,
    tipoField: string | undefined
  ): boolean {
    return (
      this.isHeaderCell(produtoField, ["Produto", "Código", "Codigo"]) ||
      this.isHeaderCell(tipoField, ["Tipo de Evento", "Tipo"])
    );
  }

  private hasAnyMainField(
    produtoField: string | undefined,
    pagamentoField: string | undefined,
    tipoField: string | undefined,
    instituicaoField: string | undefined,
    quantidadeField: string | undefined,
    precoField: string | undefined,
    valorField: string | undefined
  ): boolean {
    return [
      produtoField,
      pagamentoField,
      tipoField,
      instituicaoField,
      quantidadeField,
      precoField,
      valorField,
    ].some((value) => String(value ?? "").trim() !== "");
  }

  private normalizeOperacao(value: string | undefined): orderOperacao | null {
    const raw = String(value ?? "").trim().toLowerCase();
    if (raw.includes("compra")) return "Compra";
    if (raw.includes("venda")) return "Venda";
    return null;
  }

  private normalizeTipoProvento(value: string | undefined): proventoTipo {
    const raw = this.normalizeText(value);
    if (raw.includes("divid")) return "Dividendo";
    if (raw.includes("juros") || raw.includes("jscp") || raw.includes("capital proprio")) return "JurosSobreCapitalProprio";
    return "Rendimento";
  }

  private isHeaderCell(value: string | undefined, headers: string[]): boolean {
    const normalizedValue = this.normalizeText(value);
    if (!normalizedValue) return false;
    return headers.some((header) => this.normalizeText(header) === normalizedValue);
  }

  private isRowEmpty(row: SpreadsheetRow): boolean {
    const values = Object.values(row);
    if (!values.length) return true;
    return values.every((value) => value === null || value === undefined || String(value).trim() === "");
  }

  private normalizeCodigoFromProduto(value: string | undefined): string {
    const raw = String(value ?? "").trim().toUpperCase();
    if (!raw) return "";
    const codigoMatch = raw.match(/[A-Z]{4}\d{2}F?/);
    if (codigoMatch) {
      return String(codigoMatch[0]).trim().toUpperCase().replace(/\s+/g, "");
    }
    return String((raw.split(/\s|-|\//)[0] ?? raw)).trim().toUpperCase().replace(/\s+/g, "");
  }

  private normalizeText(value: string | undefined): string {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase();
  }
}
