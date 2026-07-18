export interface ScrapedTradingHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  timezone: string;
  tradingDays: number[];
}
