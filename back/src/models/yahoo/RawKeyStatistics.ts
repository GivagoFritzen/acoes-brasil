import type { RawValue } from './RawValue';
import type { RawDate } from './RawDate';

export interface RawKeyStatistics {
  enterpriseValue?: RawValue;
  forwardPE?: RawValue;
  profitMargins?: RawValue;
  floatShares?: RawValue;
  sharesOutstanding?: RawValue;
  heldPercentInsiders?: RawValue;
  heldPercentInstitutions?: RawValue;
  beta?: RawValue;
  bookValue?: RawValue;
  priceToBook?: RawValue;
  earningsQuarterlyGrowth?: RawValue;
  netIncomeToCommon?: RawValue;
  trailingEps?: RawValue;
  forwardEps?: RawValue;
  pegRatio?: RawValue;
  enterpriseToRevenue?: RawValue;
  enterpriseToEbitda?: RawValue;
  lastDividendValue?: RawValue;
  lastDividendDate?: RawDate;
  lastSplitFactor?: string;
}
