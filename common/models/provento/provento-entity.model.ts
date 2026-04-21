import type { ProventoTipo } from './provento-tipo.model';

export interface Provento {
  id: string;
  codigo: string;
  data: string;
  tipo: ProventoTipo;
  instituicao: string;
  quantidade: number;
  precoUnitario: number;
  valorLiquido: number;
  createdAt?: string;
  updatedAt?: string;
}
