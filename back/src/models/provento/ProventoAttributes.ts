import type { ProventoTipo as proventoTipo } from "../../../../common/models/provento";

export interface ProventoAttributes {
  id: string;
  codigo: string;
  data: string;
  tipo: proventoTipo;
  instituicao: string;
  quantidade: number;
  precoUnitario: number;
  valorLiquido: number;
  createdAt?: Date;
  updatedAt?: Date;
}
