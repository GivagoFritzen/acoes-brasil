import type { GoogleFinanceChartPoint } from './GoogleFinanceChartPoint';

export interface GoogleFinanceChart {
  previousClose: number | null;
  points: GoogleFinanceChartPoint[];
}
