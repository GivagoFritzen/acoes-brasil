import type { ProventoTipo } from "../../../../common/models/provento";

export interface CreateProventoDto {
  codigo: string;
  data: string;
  tipo: ProventoTipo;
  instituicao: string;
  quantidade: number;
  precoUnitario: number;
  valorLiquido: number;
}
