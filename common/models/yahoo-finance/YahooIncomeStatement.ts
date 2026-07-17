export interface YahooIncomeStatement {
  endDate: string;
  totalRevenue: string | null;
  costOfRevenue: string | null;
  grossProfit: string | null;
  researchDevelopment: string | null;
  sellingGeneralAdministrative: string | null;
  operatingIncome: string | null;
  ebit: string | null;
  interestExpense: string | null;
  incomeBeforeTax: string | null;
  incomeTaxExpense: string | null;
  netIncome: string | null;
  netIncomeApplicableToCommonShares: string | null;
}
