import type { FundamentusProvento, FundamentusProventosResponse } from "../../../../common/models/fundamentus";
import { normalizeCodigoForFundamentus, stripHtml } from "../../shared/utils/FundamentusUtils";

const BASE_URL = "https://www.fundamentus.com.br/proventos.php";
const REQUEST_TIMEOUT_MS = 15_000;

export class FundamentusProventosScraperService {
  async scrapeAsync(codigo: string): Promise<FundamentusProventosResponse> {
    const codigoFundamentus = normalizeCodigoForFundamentus(codigo);
    const html = await this.fetchHtmlAsync(codigoFundamentus);

    const proventos = this.parseProventos(html);

    return {
      codigo,
      proventos,
      updatedAt: new Date().toISOString(),
    };
  }

  private async fetchHtmlAsync(codigo: string): Promise<string> {
    const url = `${BASE_URL}?papel=${encodeURIComponent(codigo)}&tipo=2`;
    const abortController = new AbortController();
    const timeoutId = setTimeout(
      () => abortController.abort(),
      REQUEST_TIMEOUT_MS
    );

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
      throw new Error(`Falha ao consultar Fundamentus proventos para o ativo ${codigo}.`);
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-1");
    return decoder.decode(buffer);
  }

  private parseProventos(html: string): FundamentusProvento[] {
    const proventos: FundamentusProvento[] = [];

    const tbodyStart = html.indexOf("<tbody>");
    if (tbodyStart === -1) return proventos;

    let pos = tbodyStart;
    let iterations = 0;
    const maxIterations = 500;

    while (pos < html.length && iterations < maxIterations) {
      iterations++;

      const rowResult = this.extractTableRow(html, pos);
      if (!rowResult) break;

      const cells = rowResult.cells;
      if (cells.length >= 3) {
        const data = this.cleanCell(cells[0]);
        const valor = this.cleanCell(cells[1]);
        const tipo = this.cleanCell(cells[2]);

        if (data && tipo && valor && this.isValidDate(data)) {
          proventos.push({ data, tipo, valor });
        }
      }

      pos = rowResult.nextPos;
    }

    return proventos;
  }

  private extractTableRow(
    html: string,
    pos: number
  ): { cells: string[]; nextPos: number } | null {
    const trOpen = html.indexOf("<tr", pos);
    if (trOpen === -1) return null;

    const trClose = html.indexOf("</tr>", trOpen);
    if (trClose === -1) return null;

    const rowContent = html.substring(trOpen, trClose + 5);
    const cells: string[] = [];

    let cellPos = 0;
    while (cellPos < rowContent.length) {
      const tdOpen = rowContent.indexOf("<td", cellPos);
      if (tdOpen === -1) break;

      const tdTagClose = rowContent.indexOf(">", tdOpen);
      if (tdTagClose === -1) break;

      const tdClose = rowContent.indexOf("</td>", tdTagClose);
      if (tdClose === -1) break;

      const cellContent = rowContent.substring(tdTagClose + 1, tdClose);
      cells.push(cellContent);

      cellPos = tdClose + 5;
    }

    if (cells.length === 0) return null;

    return { cells, nextPos: trClose + 5 };
  }

  private cleanCell(value: string): string {
    return stripHtml(value).replace(/\s+/g, " ").trim();
  }

  private isValidDate(value: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
  }
}
