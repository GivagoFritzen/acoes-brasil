import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";

export class FundamentusQuoteProvider implements IQuoteProvider {
  private readonly baseUrl = "https://www.fundamentus.com.br/detalhes.php";

  async getQuoteAsync(codigo: string): Promise<number | null> {
    const codigoFundamentus = this.normalizeCodigoForFundamentus(codigo);
    const url = `${this.baseUrl}?papel=${encodeURIComponent(codigoFundamentus)}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) return null;

      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder("iso-8859-1");
      const html = decoder.decode(buffer);

      if (/papel\s+inexistente|nenhum\s+resultado/i.test(html)) {
        return null;
      }

      const pairRegex = /<td[^>]*class="label[^"]*"[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*class="data[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
      let match: RegExpExecArray | null;

      while ((match = pairRegex.exec(html)) !== null) {
        const label = this.normalizeIndicatorLabel(match[1] ?? "");
        if (label !== "cotacao") {
          continue;
        }

        const quoteText = this.stripHtml(match[2] ?? "");
        return this.parseDecimal(quoteText);
      }
    } catch (error) {
      console.error("Error fetching quote from Fundamentus:", error);
    }

    return null;
  }

  private normalizeCodigoForFundamentus(value: string): string {
    const normalized = value.trim().toUpperCase();
    if (/^[A-Z0-9]{6}$/.test(normalized) && normalized.endsWith("F")) {
      return normalized.slice(0, -1);
    }
    return normalized;
  }

  private decodeHtmlEntities(value: string): string {
    return value
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, "<")
      .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)));
  }

  private stripHtml(value: string): string {
    return this.decodeHtmlEntities(value.replace(/<[^>]*>/g, " "))
      .replace(/\s+/g, " ")
      .trim();
  }

  private normalizeIndicatorLabel(value: string): string {
    return this.stripHtml(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s*:\s*$/, "")
      .trim()
      .toLowerCase();
  }

  private parseDecimal(text: string): number | null {
    const cleanStr = text.replace(/\./g, "").replace(",", ".");
    const parsed = Number(cleanStr);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
