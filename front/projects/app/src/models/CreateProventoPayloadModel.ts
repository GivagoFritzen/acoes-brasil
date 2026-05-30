import type { ProventoTipo } from './ProventoModel';

export interface CreateProventoPayload {
  codigo: string;
  data: string;
  tipo: ProventoTipo;
  instituicao: string;
  quantidade: number;
  precoUnitario: number;
  valorLiquido: number;
}
