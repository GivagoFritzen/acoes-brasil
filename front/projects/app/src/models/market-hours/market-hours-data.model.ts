import { MarketHoursStatus } from './market-hours-status.model';

export interface MarketHoursData {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  timezone: string;
  currency: string;
  marketCap: string;
  location: string;
  website: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  holidays: string[];
  tradingDays: number[];
  nextOpenTime: string;
  currentStatus: MarketHoursStatus;
  upcomingHolidays: string[];
}