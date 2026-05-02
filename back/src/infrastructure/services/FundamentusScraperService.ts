import { FundamentusAcaoDetails } from "../../models/fundamentus/FundamentusAcaoDetails";

const BASE_URL = "https://www.fundamentus.com.br/detalhes.php";

export class FundamentusScraperService {
  async scrapeAsync(codigo: string): Promise<FundamentusAcaoDetails> {
    const codigoFundamentus = this.normalizeCodigoForFundamentus(codigo);

    const url = `${BASE_URL}?papel=${encodeURIComponent(codigoFundamentus)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao consultar Fundamentus (${response.status}).`);
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-1");
    const html = decoder.decode(buffer);

    if (/papel\s+inexistente|nenhum\s+resultado/i.test(html)) {
      throw new Error(`Ativo ${codigo} não encontrado no Fundamentus.`);
    }

    const parsed = this.parseFundamentusDetails(codigo, html);

    if (!parsed.indicadores.length) {
      throw new Error("Não foi possível extrair dados do Fundamentus.");
    }

    return parsed;
  }

  private normalizeCodigoForFundamentus(value: string): string {
    const normalized = value.trim().toUpperCase();

    if (/^[A-Z0-9]{6}$/.test(normalized) && normalized.endsWith("F")) {
      return normalized.slice(0, -1);
    }

    return normalized;
  }

  private parseFundamentusDetails(codigo: string, html: string): FundamentusAcaoDetails {
    const pairRegex = /<td[^>]*class="label[^"]*"[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*class="data[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
    const indicadoresMap = new Map<string, string>();

    let match: RegExpExecArray | null;
    while ((match = pairRegex.exec(html)) !== null) {
      const label = this.normalizeLabel(match[1] ?? "");
      const value = this.stripHtml(match[2] ?? "");

      if (!label || !value) {
        continue;
      }

      if (!indicadoresMap.has(label)) {
        indicadoresMap.set(label, value);
      }
    }

    const empresa = indicadoresMap.get("Empresa") ?? null;
    const setor = indicadoresMap.get("Setor") ?? null;
    const subsetor = indicadoresMap.get("Subsetor") ?? null;

    const indicadores = Array.from(indicadoresMap.entries())
      .filter(([label]) => !["Empresa", "Setor", "Subsetor"].includes(label))
      .map(([label, value]) => ({ label, value }));

    return {
      codigo,
      empresa,
      setor,
      subsetor,
      indicadores,
      updatedAt: new Date().toISOString(),
    };
  }

  private decodeHtmlEntities(value: string): string {
    return value
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)));
  }

  private stripHtml(value: string): string {
    return this.decodeHtmlEntities(value.replace(/<[^>]*>/g, " "))
      .replace(/\s+/g, " ")
      .trim();
  }

  private normalizeLabel(value: string): string {
    return this.stripHtml(value)
      .replace(/\s*:\s*$/, "")
      .replace(/^\?\s*/, "")
      .trim();
  }
}
