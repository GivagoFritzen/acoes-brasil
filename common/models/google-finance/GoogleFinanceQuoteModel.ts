export interface GoogleFinanceQuote {
  ticker: string;
  exchange: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number | null;
  currency: string;
  timezone: string;
}
