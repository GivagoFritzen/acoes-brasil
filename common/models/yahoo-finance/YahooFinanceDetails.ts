import type { YahooFinanceKeyStatistics } from './YahooFinanceKeyStatistics';
import type { YahooFinanceFinancialData } from './YahooFinanceFinancialData';
import type { YahooIncomeStatement } from './YahooIncomeStatement';
import type { YahooBalanceSheet } from './YahooBalanceSheet';
import type { YahooCashflowStatement } from './YahooCashflowStatement';
import type { YahooFinanceEarningsHistoryItem } from './YahooFinanceEarningsHistory';
import type { YahooFinanceCalendarEvents } from './YahooFinanceCalendarEvents';

export interface YahooFinanceDetails {
  codigo: string;
  empresa: string | null;
  keyStatistics: YahooFinanceKeyStatistics | null;
  financialData: YahooFinanceFinancialData | null;
  incomeStatements: YahooIncomeStatement[];
  balanceSheets: YahooBalanceSheet[];
  cashflowStatements: YahooCashflowStatement[];
  earningsHistory: YahooFinanceEarningsHistoryItem[];
  calendarEvents: YahooFinanceCalendarEvents | null;
  updatedAt: string;
}
