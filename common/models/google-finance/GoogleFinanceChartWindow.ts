export const CHART_WINDOWS = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'] as const;

export type GoogleFinanceChartWindow = typeof CHART_WINDOWS[number];
