import type { FundamentusAcaoDetails } from "../../../../common/models/fundamentus";
import { normalizeCodigoForFundamentus, stripHtml } from "../../shared/utils/FundamentusUtils";

const BASE_URL = "https://www.fundamentus.com.br/detalhes.php";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_HTML_LENGTH = 1_000_000;
const MAX_REGEX_ITERATIONS = 1_000;

export class FundamentusScraperService {
  async scrapeAsync(codigo: string): Promise<FundamentusAcaoDetails> {
    const codigoFundamentus = normalizeCodigoForFundamentus(codigo);

    const url = `${BASE_URL}?papel=${encodeURIComponent(codigoFundamentus)}`;
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

    if (!response.ok) {
      throw new Error(`Falha ao consultar Fundamentus (${response.status}).`);
    }

    if (!response.headers.get("content-type")?.includes("text/html")) {
      throw new Error("Resposta inesperada do Fundamentus (não é HTML).");
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-1");
    const html = decoder.decode(buffer);

    if (html.length > MAX_HTML_LENGTH) {
      throw new Error("Resposta do Fundamentus excede o tamanho máximo permitido.");
    }

    if (/papel\s+inexistente|nenhum\s+resultado/i.test(html)) {
      throw new Error(`Ativo ${codigo} não encontrado no Fundamentus.`);
    }

    const parsed = this.parseFundamentusDetails(codigo, html);

    if (!parsed.indicadores.length) {
      throw new Error("Não foi possível extrair dados do Fundamentus.");
    }

    return parsed;
  }

  private parseFundamentusDetails(codigo: string, html: string): FundamentusAcaoDetails {
    const pairRegex = /<td[^>]*class="label[^"]*"[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*class="data[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
    const indicadoresMap = new Map<string, string>();

    let match: RegExpExecArray | null;
    let iterations = 0;
    while ((match = pairRegex.exec(html)) !== null) {
      iterations++;
      if (iterations > MAX_REGEX_ITERATIONS) {
        throw new Error("Limite de iterações do parser Fundamentus excedido.");
      }

      const label = this.normalizeLabel(match[1] ?? "");
      const value = stripHtml(match[2] ?? "");

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

  private normalizeLabel(value: string): string {
    return stripHtml(value)
      .replace(/:$/, "")
      .replace(/^\?\s*/, "")
      .trim();
  }
}
