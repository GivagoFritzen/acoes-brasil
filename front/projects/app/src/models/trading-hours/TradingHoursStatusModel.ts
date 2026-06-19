export interface TradingHoursStatus {
  marketId: string;
  isOpen: boolean;
  status: string;
  nextChange: string;
  localTime: string;
  marketTime: string;
}