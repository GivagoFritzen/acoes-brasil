import type { FundamentusIndicator } from './fundamentus-indicator.model';

export interface FundamentusAcaoDetails {
  codigo: string;
  empresa: string | null;
  setor: string | null;
  subsetor: string | null;
  indicadores: FundamentusIndicator[];
  updatedAt: string;
}
