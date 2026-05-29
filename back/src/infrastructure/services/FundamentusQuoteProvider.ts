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

      const pairRegex = /<td[^>]*class="label[^"]*"[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*class="data[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
      let match: RegExpExecArray | null;
      let iterations = 0;

      while ((match = pairRegex.exec(html)) !== null) {
        iterations++;
        if (iterations > MAX_REGEX_ITERATIONS) break;

        const label = this.normalizeIndicatorLabel(match[1] ?? "");
        if (label !== "cotacao") {
          continue;
        }

        const quoteText = stripHtml(match[2] ?? "");
        return parseDecimal(quoteText);
      }
    } catch (error) {
      logger.error("Erro ao buscar cotação no Fundamentus", { error: error instanceof Error ? error.message : String(error) });
    }

    return null;
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
