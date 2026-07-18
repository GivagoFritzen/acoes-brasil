import type { Investidor10AcaoDetails, Investidor10HistoricoIndicador, Investidor10Indicator, Investidor10Provento, Investidor10ProventosResponse, Investidor10ValorHistorico, Investidor10ReceitaAno, Investidor10SegmentoReceita, Investidor10RegiaoReceita } from "../../../../common/models/investidor10";
import type { JsonValue } from "../../models/JsonValue";
import { stripHtml } from "../../shared/utils/FundamentusUtils";

const BASE_URL = "https://investidor10.com.br/acoes";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_HTML_LENGTH = 2_000_000;

const API_BASE = "https://investidor10.com.br";

export class Investidor10ScraperService {
  async scrapeAsync(codigo: string): Promise<Investidor10AcaoDetails> {
    const codigoNormalized = codigo.trim().toUpperCase();
    const url = `${BASE_URL}/${encodeURIComponent(codigoNormalized)}/`;

    const html = await this.fetchHtmlAsync(url);

    if (!html) {
      throw new Error(`Falha ao consultar Investidor10 para o ativo ${codigo}.`);
    }

    const dadosSobreEmpresa = this.parseDadosSobreEmpresa(html);
    const informacoesSobreEmpresa = this.parseInformacoesSobreEmpresa(html);
    const indicadoresFundamentalistas = this.parseIndicadoresFundamentalistas(html);

    const empresa = this.extractEmpresa(dadosSobreEmpresa);

    if (!indicadoresFundamentalistas.length && !informacoesSobreEmpresa.length) {
      throw new Error("Não foi possível extrair dados do Investidor10.");
    }

    const stockId = this.extractStockId(html);
    const historicoIndicadores = stockId ? await this.fetchHistoricoIndicadoresAsync(stockId) : [];
    const receitas = this.parseRevenueData(html);

    return {
      codigo: codigoNormalized,
      empresa,
      dadosSobreEmpresa,
      informacoesSobreEmpresa,
      indicadoresFundamentalistas,
      historicoIndicadores,
      receitas,
      updatedAt: new Date().toISOString(),
    };
  }

  private async fetchHtmlAsync(url: string): Promise<string | null> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) return null;
    if (!response.headers.get("content-type")?.includes("text/html")) return null;

    const text = await response.text();

    if (text.length > MAX_HTML_LENGTH) return null;
    if (text.includes(" papel inexistente") || text.includes("página não encontrada")) return null;

    return text;
  }

  private extractEmpresa(dados: Investidor10Indicator[]): string | null {
    const nome = dados.find((dado) => dado.label === "Nome da Empresa");
    return nome?.value ?? null;
  }

  private extractStockId(html: string): string | null {
    const match = html.match(/data-id=["'](\d+)["']/);
    return match ? match[1] : null;
  }

  private async fetchHistoricoIndicadoresAsync(stockId: string): Promise<Investidor10HistoricoIndicador[]> {
    const url = `${API_BASE}/api/historico-indicadores/${stockId}/5/?v=2`;
    const json = await this.fetchJsonAsync(url);
    if (!json || typeof json !== "object") return [];

    const historico: Investidor10HistoricoIndicador[] = [];
    for (const [indicador, valores] of Object.entries(json)) {
      if (!Array.isArray(valores)) continue;
      const valoresTipados: Investidor10ValorHistorico[] = valores.map((v: { year: string; value: string; type: string }) => ({
        ano: Number(v.year),
        valor: Number(v.value),
        tipo: v.type === "percent" ? "percent" : "numeric",
      }));
      historico.push({ indicador, valores: valoresTipados });
    }
    return historico;
  }

  private async fetchJsonAsync(url: string): Promise<Record<string, JsonValue> | null> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: `${API_BASE}/acoes/`,
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) return null;
      const text = await response.text();
      if (!text) return null;

      return JSON.parse(text);
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async scrapeDividendosAsync(codigo: string): Promise<Investidor10ProventosResponse> {
    const codigoNormalized = codigo.trim().toUpperCase();
    const url = `${BASE_URL}/${encodeURIComponent(codigoNormalized)}/`;

    const html = await this.fetchHtmlAsync(url);

    if (!html) {
      throw new Error(`Falha ao consultar Investidor10 para o ativo ${codigo}.`);
    }

    const proventos = this.parseDividendos(html);

    return {
      codigo: codigoNormalized,
      proventos,
      updatedAt: new Date().toISOString(),
    };
  }

  private parseDividendos(html: string): Investidor10Provento[] {
    const section = this.extractTagById(html, "table-dividends-history");
    if (!section) return [];

    const proventos: Investidor10Provento[] = [];
    const rows = this.extractAllTags(section.html, "tr");

    for (const row of rows) {
      const cells = this.extractAllTags(row.html, "td");
      if (cells.length >= 4) {
        const tipo = stripHtml(cells[0].html).trim();
        const dataPagamento = stripHtml(cells[2].html).trim();
        const valor = stripHtml(cells[3].html).trim();

        if (tipo && dataPagamento && valor) {
          proventos.push({
            tipo,
            data: dataPagamento,
            valor: valor.replace(",", "."),
          });
        }
      }
    }

    return proventos;
  }

  private parseDadosSobreEmpresa(html: string): Investidor10Indicator[] {
    const section = this.extractTagById(html, "data_about");
    if (!section) return [];

    const tableContent = this.extractTag(section.html, "table");
    if (!tableContent) return [];

    const indicators: Investidor10Indicator[] = [];
    const rows = this.extractAllTags(tableContent.html, "tr");

    for (const row of rows) {
      const cells = this.extractAllTags(row.html, "td");
      if (cells.length >= 2) {
        const label = stripHtml(cells[0].html).replace(/:$/, "").trim();
        const value = stripHtml(cells[1].html).trim();
        if (label && value) {
          indicators.push({ label, value });
        }
      }
    }

    return indicators;
  }

  private parseInformacoesSobreEmpresa(html: string): Investidor10Indicator[] {
    const section = this.extractTagById(html, "info_about");
    if (!section) return [];

    const gridSection = this.extractTagById(section.html, "table-indicators-company");
    if (!gridSection) return [];

    const indicators: Investidor10Indicator[] = [];
    const cells = this.extractAllTags(gridSection.html, "div", "cell");

    for (const cell of cells) {
      const titleTag = this.extractTag(cell.html, "span", "title");
      const valueTag = this.extractTag(cell.html, "span", "value");

      if (titleTag) {
        const label = stripHtml(titleTag.html).trim();
        let value = valueTag ? stripHtml(valueTag.html).trim() : "";

        if (label && value) {
          indicators.push({ label, value });
        }
      }
    }

    return indicators;
  }

  private parseIndicadoresFundamentalistas(html: string): Investidor10Indicator[] {
    const section = this.extractTagById(html, "table-indicators");
    if (!section) return [];

    const indicators: Investidor10Indicator[] = [];
    const cells = this.extractAllCells(section.html, "div", "cell");

    for (const cell of cells) {
      let label = "";
      let value = "";

      const labelMatch = cell.html.match(/<span[^>]*class="[^"]*d-flex[^"]*"[^>]*>([\s\S]*?)<\/span>/);
      if (labelMatch) {
        const withoutIcon = labelMatch[1].replace(/<i[\s\S]*?<\/i>/g, "").trim();
        if (withoutIcon) {
          label = stripHtml(withoutIcon);
        }
      }

      const valueMatch = cell.html.match(/<div[^>]*class="[^"]*value[^"]*"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/);
      if (valueMatch) {
        value = stripHtml(valueMatch[1]).trim();
      }

      if (label && value) {
        indicators.push({ label, value });
      }
    }

    return indicators;
  }

  private extractAllCells(html: string, tagName: string, className: string): { html: string }[] {
    const results: { html: string }[] = [];
    const pattern = `<${tagName}[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>`;
    const tagRegex = new RegExp(pattern);

    let remaining = html;
    while (remaining.length > 0) {
      const match = tagRegex.exec(remaining);
      if (!match) break;

      const openTagStart = match.index;
      const closeEnd = this.findMatchingClose(remaining, openTagStart, tagName);
      if (!closeEnd) break;

      const inner = remaining.substring(openTagStart, closeEnd);
      const contentEnd = inner.indexOf(">", tagName.length + 1) + 1;
      const innerContent = inner.substring(contentEnd, inner.length - tagName.length - 3);

      results.push({ html: innerContent });
      remaining = remaining.substring(closeEnd);
    }

    return results;
  }

  private extractTagById(html: string, id: string): { html: string } | null {
    const idRegex = new RegExp(`id=["']${id}["']`);
    const idMatch = idRegex.exec(html);
    if (!idMatch) return null;

    const tagStart = html.lastIndexOf("<", idMatch.index);
    if (tagStart === -1) return null;

    const tagEnd = html.indexOf(">", idMatch.index);
    if (tagEnd === -1) return null;

    const tagContent = html.substring(tagStart, tagEnd + 1);
    const tagNameMatch = tagContent.match(/^<\/?(\w+)/);
    if (!tagNameMatch) return null;

    const tagName = tagNameMatch[1];
    const result = this.findMatchingClose(html, tagStart, tagName);
    if (!result) return null;

    return { html: html.substring(tagStart, result) };
  }

  private extractTag(html: string, tagName: string, className?: string): { html: string } | null {
    let pattern: string;
    if (className) {
      pattern = `<${tagName}[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>`;
    } else {
      pattern = `<${tagName}[^>]*>`;
    }

    const tagRegex = new RegExp(pattern);
    const match = tagRegex.exec(html);
    if (!match) return null;

    const tagStart = match.index;
    const result = this.findMatchingClose(html, tagStart, tagName);
    if (!result) return null;

    const inner = html.substring(tagStart, result);
    const contentEnd = inner.indexOf(">", tagName.length + 1) + 1;
    const innerContent = inner.substring(contentEnd, inner.length - tagName.length - 3);

    return { html: innerContent };
  }

  private extractAllTags(html: string, tagName: string, className?: string): { html: string }[] {
    const results: { html: string }[] = [];
    let remaining = html;

    while (remaining.length > 0) {
      const tag = this.extractTag(remaining, tagName, className);
      if (!tag) break;

      results.push(tag);
      const tagStart = remaining.indexOf(`<${tagName}`);
      if (tagStart === -1) break;

      const closeTag = `</${tagName}>`;
      const closeIdx = remaining.indexOf(closeTag, tagStart);
      if (closeIdx === -1) break;

      remaining = remaining.substring(closeIdx + closeTag.length);
    }

    return results;
  }

  private findMatchingClose(html: string, openTagStart: number, tagName: string): number | null {
    let depth = 0;
    let foundOpening = false;
    const regex = new RegExp(`</?${tagName}(?:\\s[^>]*)?>`, "gi");
    regex.lastIndex = openTagStart;

    let match;
    while ((match = regex.exec(html)) !== null) {
      const fullTag = match[0];
      const isClosing = fullTag.startsWith("</");

      if (!foundOpening) {
        if (!isClosing) {
          foundOpening = true;
          depth = 1;
        }
        continue;
      }

      if (isClosing) {
        depth--;
        if (depth === 0) return regex.lastIndex;
      } else {
        depth++;
      }
    }

    return null;
  }

  private parseRevenueData(html: string): Investidor10ReceitaAno[] {
    const revenuesRaw = this.extractJSObject(html, "companyRevenues");
    const bussinesRaw = this.extractJSObject(html, "companyBussinesRevenues");
    if (!revenuesRaw || !bussinesRaw) return [];

    let revenues: Record<string, JsonValue>;
    let bussinesRevenues: Record<string, JsonValue>;

    try {
      revenues = JSON.parse(this.sanitizeJSON(revenuesRaw));
      bussinesRevenues = JSON.parse(this.sanitizeJSON(bussinesRaw));
    } catch {
      return [];
    }

    const result: Investidor10ReceitaAno[] = [];

    for (const [ano, data] of Object.entries(revenues)) {
      if (!data || typeof data !== "object") continue;
      const revenueData = data as { totalRevenue?: string; company_revenue_country?: { name?: string; pivot: { percentage: number } }[] };

      const bussinesData = bussinesRevenues[ano] as { company_revenue_bussines?: { bussines?: string; percentage: number }[] } | undefined;
      const regioes = this.mapRegioes(revenueData);
      const negocios = this.mapNegocios(bussinesData);

      result.push({
        ano: Number(ano),
        receitaTotal: String(revenueData.totalRevenue ?? ""),
        regioes,
        negocios,
      });
    }

    return result.sort((a, b) => b.ano - a.ano);
  }

  private mapRegioes(data: {
    totalRevenue?: string;
    company_revenue_country?: { name?: string; pivot: { percentage: number } }[];
  }): Investidor10RegiaoReceita[] {
    if (!data?.company_revenue_country) return [];
    return data.company_revenue_country
      .filter((regiao) => regiao && regiao.pivot && typeof regiao.pivot.percentage === "number")
      .map((regiao) => ({
        nome: String(regiao.name ?? ""),
        porcentagem: regiao.pivot.percentage,
      }));
  }

  private mapNegocios(bussinesData: {
    company_revenue_bussines?: { bussines?: string; percentage: number }[];
  } | undefined): Investidor10SegmentoReceita[] {
    if (!bussinesData?.company_revenue_bussines) return [];
    return bussinesData.company_revenue_bussines
      .filter((negocio) => negocio && typeof negocio.percentage === "number")
      .map((negocio) => ({
        nome: String(negocio.bussines ?? ""),
        porcentagem: negocio.percentage,
      }));
  }

  private extractJSObject(html: string, varName: string): string | null {
    const regex = new RegExp(`let\\s+${varName}\\s*=\\s*`);
    const match = regex.exec(html);
    if (!match) return null;

    const objStart = html.indexOf("{", match.index + match[0].length);
    if (objStart === -1) return null;

    let depth = 0;
    let posicao = objStart;

    while (posicao < html.length) {
      const ch = html[posicao];

      if (ch === '"') {
        const endOfString = this.skipString(html, posicao + 1);
        posicao = endOfString === posicao ? posicao + 1 : endOfString + 1;
        continue;
      }

      if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          return html.substring(objStart, posicao + 1);
        }
      }

      posicao++;
    }

    return null;
  }

  private skipString(html: string, start: number): number {
    let posicao = start;
    while (posicao < html.length) {
      const char = html[posicao];
      if (char === '"') return posicao;
      posicao += char === "\\" ? 2 : 1;
    }
    return posicao;
  }

  private sanitizeJSON(str: string): string {
    return str.replace(/,(\s*[}\]])/g, "$1");
  }
}
