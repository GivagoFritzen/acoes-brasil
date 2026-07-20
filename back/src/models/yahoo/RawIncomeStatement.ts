import type { RawDate } from './RawDate';
import type { RawValue } from './RawValue';

export interface RawIncomeStatement {
  endDate?: RawDate;
  totalRevenue?: RawValue;
  costOfRevenue?: RawValue;
  grossProfit?: RawValue;
  researchDevelopment?: RawValue;
  sellingGeneralAdministrative?: RawValue;
  operatingIncome?: RawValue;
  ebit?: RawValue;
  interestExpense?: RawValue;
  incomeBeforeTax?: RawValue;
  incomeTaxExpense?: RawValue;
  netIncome?: RawValue;
  netIncomeApplicableToCommonShares?: RawValue;
}
