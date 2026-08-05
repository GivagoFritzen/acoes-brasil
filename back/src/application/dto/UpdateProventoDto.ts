import type { ProventoTipo as proventoTipo } from "../../../../common/models/provento";

export interface UpdateProventoDto {
  codigo: string;
  data: string;
  tipo: proventoTipo;
  instituicao: string;
  quantidade: number;
  precoUnitario: number;
  valorLiquido: number;
}