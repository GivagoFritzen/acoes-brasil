export interface TradingHoursServiceTest {
  parseHtml(html: string): object;
  extractStatus(html: string): string | null;
  extractHoursText(html: string): string | null;
  parseHoursFromText(text: string): object | null;
}
