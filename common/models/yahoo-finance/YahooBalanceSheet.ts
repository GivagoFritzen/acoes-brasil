export interface YahooBalanceSheet {
  endDate: string;
  totalAssets: string | null;
  totalCurrentAssets: string | null;
  cash: string | null;
  totalCurrentLiabilities: string | null;
  totalLiabilities: string | null;
  longTermDebt: string | null;
  shortLongTermDebt: string | null;
  totalShareholderEquity: string | null;
  minorityInterest: string | null;
  netTangibleAssets: string | null;
  goodwill: string | null;
  intangibleAssets: string | null;
  otherCurrentAssets: string | null;
  otherCurrentLiabilities: string | null;
  otherAssets: string | null;
  otherLiabilities: string | null;
  propertyPlantEquipment: string | null;
  inventory: string | null;
  receivables: string | null;
  payable: string | null;
  deferredLongTermAssetCharges: string | null;
  treasuryStock: string | null;
}
