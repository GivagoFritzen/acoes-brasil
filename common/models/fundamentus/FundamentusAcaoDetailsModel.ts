import type { FundamentusIndicator } from './FundamentusIndicatorModel';

export interface FundamentusAcaoDetails {
  codigo: string;
  empresa: string | null;
  setor: string | null;
  subsetor: string | null;
  indicadores: FundamentusIndicator[];
  updatedAt: string;
}
