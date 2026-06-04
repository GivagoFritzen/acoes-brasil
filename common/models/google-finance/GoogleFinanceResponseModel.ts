import type { GoogleFinanceQuote } from './GoogleFinanceQuoteModel';
import type { GoogleFinanceChart } from './GoogleFinanceChart';

export interface GoogleFinanceResponse {
  quote: GoogleFinanceQuote | null;
  chart: GoogleFinanceChart | null;
  updatedAt: string;
}
