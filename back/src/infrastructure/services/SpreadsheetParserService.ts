import { SpreadsheetRow, extractField, parseDecimal, readSpreadsheetRows, toBrDateString } from "../../utils/Spreadsheet";
import type { ProventoTipo as proventoTipo } from "../../../../common/models/provento";
import { CreateOrderDto } from "../../application/dto/CreateOrderDto";
import { CreateProventoDto } from "../../application/dto/CreateProventoDto";
import type { OrderOperacao as orderOperacao } from "../../../../common/models/order";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { detectSupportedAssetTypeFromTicker } from "../../../../common/utils/AssetTypeUtils";
import { ParseProventoResult } from "../../models/ParseProventoResult";

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
      const data = toBrDateString(extractField(row, ["Data do Negócio", "Data do Negocio", "Data"]));
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

      const seemsHeaderRow =
        this.isHeaderCell(produtoField, ["Produto", "Código", "Codigo"]) ||
        this.isHeaderCell(tipoField, ["Tipo de Evento", "Tipo"]);

      if (seemsHeaderRow) {
        continue;
      }

      const hasAnyMainField = [produtoField, pagamentoField, tipoField, instituicaoField, quantidadeField, precoField, valorField]
        .some((value) => String(value ?? "").trim() !== "");

      if (!hasAnyMainField) {
        invalidLineNumbers.push(lineNumber);
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

      validRows.push({ codigo, data, tipo, instituicao, quantidade, precoUnitario, valorLiquido });
    }

    return { validRows, invalidLineNumbers };
  }

  private normalizeOperacao(value: unknown): orderOperacao | null {
    const raw = String(value ?? "").trim().toLowerCase();
    if (raw.includes("compra")) return "Compra";
    if (raw.includes("venda")) return "Venda";
    return null;
  }

  private normalizeTipoProvento(value: unknown): proventoTipo {
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
