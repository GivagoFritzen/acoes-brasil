import type { GoogleFinanceChartPoint, GoogleFinanceResponse } from "../../../../common/models/google-finance";
import { logger } from "../../shared/logger/Logger";
import type { JsonValue } from "../../models/JsonValue";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const REQUEST_TIMEOUT_MS = 10_000;

const RANGE_MAP: Record<string, string> = {
  "1D": "1d",
  "5D": "5d",
  "1M": "1mo",
  "6M": "6mo",
  "YTD": "ytd",
  "1Y": "1y",
  "5Y": "5y",
  "MAX": "max",
};

const INTERVAL_MAP: Record<string, string> = {
  "1D": "5m",
  "5D": "15m",
  "1M": "90m",
  "6M": "1d",
  "YTD": "1d",
  "1Y": "1d",
  "5Y": "1wk",
  "MAX": "1mo",
};

export class GoogleFinanceService {
  async getDataAsync(codigo: string, chartWindow: string = "1Y"): Promise<GoogleFinanceResponse> {
    const normalizedCode = this.normalizeCodigo(codigo);
    const yahooTicker = `${normalizedCode}.SA`;
    const range = RANGE_MAP[chartWindow] ?? "1y";
    const interval = INTERVAL_MAP[chartWindow] ?? "1d";

    logger.info(`Consultando Yahoo Finance para ${yahooTicker} (range: ${range}, interval: ${interval})`);

    const url = `${YAHOO_BASE}/${encodeURIComponent(yahooTicker)}?range=${range}&interval=${interval}&includePrePost=false`;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      logger.error(`Yahoo Finance retornou ${response.status} para ${yahooTicker}`);
      return this.emptyResponse();
    }

    const text = await response.text();
    return this.parseResponse(text, normalizedCode);
  }

  private normalizeCodigo(codigo: string): string {
    const upper = codigo.trim().toUpperCase();
    let indice = upper.length - 1;
    while (indice >= 0 && upper[indice] >= "A" && upper[indice] <= "Z") indice--;
    const trailing = upper.length - 1 - indice;
    if (trailing <= 1 && upper.length >= 5)
      return upper.slice(0, indice + 1);
    return upper;
  }

  private parseResponse(text: string, codigo: string): GoogleFinanceResponse {
    const json = this.tryParseJson(text);
    if (!json) return this.emptyResponse();

    const chartJson = json as { chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ close?: (number | null)[]; volume?: (number | null)[] }> }; meta?: { chartPreviousClose?: number | null; regularMarketPrice?: number | null; symbol?: string; currency?: string; timezone?: string } }> } };
    const result = chartJson.chart?.result?.[0];
    if (!result) {
      logger.warn(`Yahoo Finance: sem dados para ${codigo}`);
      return this.emptyResponse();
    }

    const points = this.buildChartPoints(result);
    logger.info(`Yahoo Finance: ${points.length} pontos carregados para ${codigo}`);

    return this.buildResponse(result, codigo, points);
  }

  private tryParseJson(text: string): JsonValue | null {
    try {
      return JSON.parse(text);
    } catch (err) {
      logger.error(`Erro ao parsear resposta do Yahoo Finance`, {
        error: err instanceof Error ? err.message : String(err),
        preview: text.slice(0, 200),
      });
      return null;
    }
  }

  private buildChartPoints(result: { timestamp?: number[]; indicators?: { quote?: Array<{ close?: (number | null)[]; volume?: (number | null)[] }> } }): GoogleFinanceChartPoint[] {
    const timestamps: number[] = result.timestamp ?? [];
    const quotes = result.indicators?.quote?.[0] ?? {};
    const closes: (number | null)[] = quotes.close ?? [];
    const volumes: (number | null)[] = quotes.volume ?? [];

    const points: GoogleFinanceChartPoint[] = [];

    const MILISSEGUNDOS_POR_SEGUNDO = 1000;

    for (let indice = 0; indice < timestamps.length; indice++) {
      const ts = timestamps[indice];
      const close = closes[indice];
      if (!ts || close == null) continue;

      const date = new Date(ts * MILISSEGUNDOS_POR_SEGUNDO);
      const ano = date.getFullYear();
      const mes = String(date.getMonth() + 1).padStart(2, "0");
      const dia = String(date.getDate()).padStart(2, "0");

      points.push({
        timestamp: ts * MILISSEGUNDOS_POR_SEGUNDO,
        date: `${ano}-${mes}-${dia}`,
        price: close,
        volume: volumes[indice] ?? null,
      });
    }

    return points;
  }

  private buildResponse(result: { meta?: { chartPreviousClose?: number | null; regularMarketPrice?: number | null; symbol?: string; currency?: string; timezone?: string } }, codigo: string, points: GoogleFinanceChartPoint[]): GoogleFinanceResponse {
    const meta = result.meta ?? {};
    const previousClose = meta.chartPreviousClose ?? null;
    const currentPrice = meta.regularMarketPrice ?? null;

    return {
      quote: currentPrice != null ? {
        ticker: codigo,
        exchange: "BVMF",
        name: meta.symbol ?? codigo,
        price: currentPrice,
        change: currentPrice - (previousClose ?? currentPrice),
        changePercent: previousClose && previousClose > 0
          ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
        previousClose,
        currency: meta.currency ?? "BRL",
        timezone: meta.timezone ?? "",
      } : null,
      chart: {
        previousClose,
        points,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  private emptyResponse(): GoogleFinanceResponse {
    return { quote: null, chart: null, updatedAt: new Date().toISOString() };
  }
}
