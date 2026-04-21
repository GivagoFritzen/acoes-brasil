import { MarketHoursData } from './market-hours-data.model';

export interface MarketHoursResponse {
  success: boolean;
  data: MarketHoursData;
}