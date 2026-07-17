export interface YahooCashflowStatement {
  endDate: string;
  netIncome: string | null;
  depreciation: string | null;
  changeToNetincome: string | null;
  changeToAccountReceivables: string | null;
  changeToLiabilities: string | null;
  changeToInventory: string | null;
  changeToOperatingActivities: string | null;
  totalCashFromOperatingActivities: string | null;
  capitalExpenditures: string | null;
  investments: string | null;
  otherCashflowsFromInvestingActivities: string | null;
  totalCashFromInvestingActivities: string | null;
  dividendsPaid: string | null;
  netBorrowings: string | null;
  otherCashflowsFromFinancingActivities: string | null;
  totalCashFromFinancingActivities: string | null;
  effectOfExchangeRate: string | null;
  changeInCash: string | null;
  repurchaseOfStock: string | null;
  issuanceOfStock: string | null;
}
