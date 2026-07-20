import type { RawDate } from './RawDate';
import type { RawValue } from './RawValue';

export interface RawCashflowStatement {
  endDate?: RawDate;
  netIncome?: RawValue;
  depreciation?: RawValue;
  changeToNetincome?: RawValue;
  changeToAccountReceivables?: RawValue;
  changeToLiabilities?: RawValue;
  changeToInventory?: RawValue;
  changeToOperatingActivities?: RawValue;
  totalCashFromOperatingActivities?: RawValue;
  capitalExpenditures?: RawValue;
  investments?: RawValue;
  otherCashflowsFromInvestingActivities?: RawValue;
  totalCashFromInvestingActivities?: RawValue;
  dividendsPaid?: RawValue;
  netBorrowings?: RawValue;
  otherCashflowsFromFinancingActivities?: RawValue;
  totalCashFromFinancingActivities?: RawValue;
  effectOfExchangeRate?: RawValue;
  changeInCash?: RawValue;
  repurchaseOfStock?: RawValue;
  issuanceOfStock?: RawValue;
}
