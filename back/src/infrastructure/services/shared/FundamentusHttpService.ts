import { stripHtml } from "../../../shared/utils/FundamentusUtils";

const BASE_URL = "https://www.fundamentus.com.br/detalhes.php";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_HTML_LENGTH = 1_000_000;
export const MAX_REGEX_ITERATIONS = 1_000;
export const LABEL_CLASS = 'class="label';
export const DATA_CLASS = 'class="data';
const NOT_FOUND_PATTERN = /papel\s+inexistente|nenhum\s+resultado/i;
import type { FetchResult } from "../../../models/FetchResult";

export abstract class FundamentusHttpService {
  protected async fetchHtmlAsync(codigo: string): Promise<FetchResult> {
    const url = `${BASE_URL}?papel=${encodeURIComponent(codigo)}`;
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
      return { html: "", found: false };
    }

    if (!response.headers.get("content-type")?.includes("text/html")) {
      return { html: "", found: false };
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-1");
    const html = decoder.decode(buffer);

    if (html.length > MAX_HTML_LENGTH) {
      return { html: "", found: false };
    }

    if (NOT_FOUND_PATTERN.test(html)) {
      return { html: "", found: false };
    }

    return { html, found: true };
  }

  protected extractHtmlSegment(
    html: string,
    pos: number,
    searchAttr: string,
    endMarker: string
  ): { text: string; nextPos: number } | null {
    const idx = html.indexOf(searchAttr, pos);
    if (idx === -1) return null;

    const tdClose = html.indexOf(">", idx);
    if (tdClose === -1) return null;

    const start = tdClose + 1;
    const end = html.indexOf(endMarker, start);
    if (end === -1) return null;

    return {
      text: stripHtml(html.substring(start, end)),
      nextPos: end + endMarker.length,
    };
  }

  protected normalizeLabel(value: string): string {
    return stripHtml(value)
      .replace(/:$/, "")
      .replace(/^\?\s*/, "")
      .trim();
  }

  protected normalizeLabelForSearch(value: string): string {
    return stripHtml(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/:$/, "")
      .trim()
      .toLowerCase();
  }
}