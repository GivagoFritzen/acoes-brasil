import { logger } from "../../shared/logger/Logger";

const TRADINGHOURS_URL = "https://www.tradinghours.com/markets/bovespa";
const REQUEST_TIMEOUT_MS = 10_000;

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export interface ScrapedTradingHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  timezone: string;
  tradingDays: number[];
}

const DEFAULT_HOURS: ScrapedTradingHours = {
  isOpen: false,
  openTime: "10:00",
  closeTime: "16:55",
  timezone: "America/Sao_Paulo",
  tradingDays: [1, 2, 3, 4, 5],
};

export class TradingHoursScraperService {
  async scrapeAsync(): Promise<ScrapedTradingHours> {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(TRADINGHOURS_URL, {
          signal: abortController.signal,
          headers: {
            "User-Agent": BROWSER_UA,
            "Accept": "text/html",
          },
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        logger.warn(`TradingHours retornou ${response.status}`);
        return { ...DEFAULT_HOURS };
      }

      const html = await response.text();
      return this.parseHtml(html);
    } catch (error) {
      logger.error("Falha ao scrapear TradingHours", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { ...DEFAULT_HOURS };
    }
  }

  private parseHtml(html: string): ScrapedTradingHours {
    const status = this.extractStatus(html);
    const timezone = this.extractTimezone(html);
    const hoursText = this.extractHoursText(html);

    const { openTime: defaultOpen, closeTime: defaultClose } = DEFAULT_HOURS;

    let openTime = defaultOpen;
    let closeTime = defaultClose;

    if (hoursText) {
      const parsed = this.parseHoursFromText(hoursText);
      if (parsed) {
        openTime = parsed.openTime;
        closeTime = parsed.closeTime;
      }
    }

    const isOpen = status === "Open";

    return {
      isOpen,
      openTime,
      closeTime,
      timezone: timezone || DEFAULT_HOURS.timezone,
      tradingDays: [1, 2, 3, 4, 5],
    };
  }

  private extractStatus(html: string): string | null {
    const match = html.match(/status:\s*'([^']+)'/);
    return match ? match[1] : null;
  }

  private extractTimezone(html: string): string | null {
    const match = html.match(/<meta[^>]*timezone[^>]*content="([^"]+)"/);
    return match ? match[1] : null;
  }

  private extractHoursText(html: string): string | null {
    const match = html.match(/B3 is open[^<]*/i);
    return match ? match[0].trim() : null;
  }

  private parseHoursFromText(text: string): { openTime: string; closeTime: string } | null {
    const match = text.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    if (!match) return null;
    return { openTime: match[1], closeTime: match[2] };
  }
}
