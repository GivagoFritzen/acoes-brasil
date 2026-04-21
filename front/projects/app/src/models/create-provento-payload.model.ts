import type { ProventoTipo } from './provento.model';

export interface CreateProventoPayload {
  codigo: string;
  data: string;
  tipo: ProventoTipo;
  instituicao: string;
  quantidade: number;
  precoUnitario: number;
  valorLiquido: number;
}
