import type { RawValue } from './RawValue';
import type { RawDate } from './RawDate';

export interface RawEarningsItem {
  epsActual?: RawValue;
  epsEstimate?: RawValue;
  epsDifference?: RawValue;
  surprisePercent?: RawValue;
  quarter?: RawDate;
  currency?: string;
  period?: string;
}
