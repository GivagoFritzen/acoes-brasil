import type { FundamentusProvento } from './FundamentusProventoModel';

export interface FundamentusProventosResponse {
  codigo: string;
  proventos: FundamentusProvento[];
  updatedAt: string;
}
