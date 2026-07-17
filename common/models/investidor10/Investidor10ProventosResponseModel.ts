import type { Investidor10Provento } from './Investidor10ProventoModel';

export interface Investidor10ProventosResponse {
  codigo: string;
  proventos: Investidor10Provento[];
  updatedAt: string;
}
