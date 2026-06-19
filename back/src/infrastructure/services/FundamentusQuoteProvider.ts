import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { normalizeCodigoForFundamentus, stripHtml } from "../../shared/utils/FundamentusUtils";
import { logger } from "../../shared/logger/Logger";
import { parseDecimal } from "../../../../common/utils/parseDecimal";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_HTML_LENGTH = 1_000_000;
const MAX_REGEX_ITERATIONS = 1_000;

export class FundamentusQuoteProvider implements IQuoteProvider {
  private readonly baseUrl = "https://www.fundamentus.com.br/detalhes.php";

  async getQuoteAsync(codigo: string): Promise<number | null> {
    const codigoFundamentus = normalizeCodigoForFundamentus(codigo);
    const url = `${this.baseUrl}?papel=${encodeURIComponent(codigoFundamentus)}`;

    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(url, {
          signal: abortController.signal,
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "text/html,application/xhtml+xml",
          },
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) return null;

      if (!response.headers.get("content-type")?.includes("text/html")) {
        return null;
      }

      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder("iso-8859-1");
      const html = decoder.decode(buffer);

      if (html.length > MAX_HTML_LENGTH) {
        return null;
      }

      if (/papel\s+inexistente|nenhum\s+resultado/i.test(html)) {
        return null;
      }

      const quote = this.findQuoteInHtml(html);
      if (quote !== null) return quote;
    } catch (error) {
      logger.error("Erro ao buscar cotação no Fundamentus", { error: error instanceof Error ? error.message : String(error) });
    }

    return null;
  }

  private findQuoteInHtml(html: string): number | null {
    let pos = 0;
    let iterations = 0;

    while (pos < html.length && iterations < MAX_REGEX_ITERATIONS) {
      iterations++;
      const result = this.tryExtractQuote(html, pos);
      if (result === null) return null;
      if (result.quote !== undefined) return result.quote;
      pos = result.nextPos;
    }

    return null;
  }

  private tryExtractQuote(html: string, pos: number): { quote?: number; nextPos: number } | null {
    const labelAttr = 'class="label';
    const dataAttr = 'class="data';

    const labelIdx = html.indexOf(labelAttr, pos);
    if (labelIdx === -1) return null;

    const tdClose = html.indexOf(">", labelIdx);
    if (tdClose === -1) return null;

    const labelStart = tdClose + 1;
    const labelEnd = html.indexOf("</td>", labelStart);
    if (labelEnd === -1) return null;

    const label = this.normalizeIndicatorLabel(html.substring(labelStart, labelEnd));
    if (label !== "cotacao") return { nextPos: labelEnd + 5 };

    const dataIdx = html.indexOf(dataAttr, labelEnd + 5);
    if (dataIdx === -1) return null;

    const dataTdClose = html.indexOf(">", dataIdx);
    if (dataTdClose === -1) return null;

    const dataStart = dataTdClose + 1;
    const dataEnd = html.indexOf("</td>", dataStart);
    if (dataEnd === -1) return null;

    const quoteText = stripHtml(html.substring(dataStart, dataEnd));
    const quote = parseDecimal(quoteText);
    if (quote === null) return null;
    return { quote, nextPos: dataEnd + 5 };
  }

  private normalizeIndicatorLabel(value: string): string {
    return stripHtml(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/:$/, "")
      .trim()
      .toLowerCase();
  }
}
