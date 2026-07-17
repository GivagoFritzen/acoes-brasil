import type { RawDate } from './RawDate';
import type { RawValue } from './RawValue';

export interface RawBalanceSheet {
  endDate?: RawDate;
  totalAssets?: RawValue;
  totalCurrentAssets?: RawValue;
  cash?: RawValue;
  totalCurrentLiabilities?: RawValue;
  totalLiabilities?: RawValue;
  longTermDebt?: RawValue;
  shortLongTermDebt?: RawValue;
  totalShareholderEquity?: RawValue;
  minorityInterest?: RawValue;
  netTangibleAssets?: RawValue;
  goodwill?: RawValue;
  intangibleAssets?: RawValue;
  otherCurrentAssets?: RawValue;
  otherCurrentLiabilities?: RawValue;
  otherAssets?: RawValue;
  otherLiabilities?: RawValue;
  propertyPlantEquipment?: RawValue;
  inventory?: RawValue;
  receivables?: RawValue;
  payable?: RawValue;
  deferredLongTermAssetCharges?: RawValue;
  treasuryStock?: RawValue;
}
