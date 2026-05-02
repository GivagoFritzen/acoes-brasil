import { ProventoTipo } from "./ProventoTipo";

export interface ProventoAttributes {
  id: string;
  codigo: string;
  data: string;
  tipo: ProventoTipo;
  instituicao: string;
  quantidade: number;
  precoUnitario: number;
  valorLiquido: number;
  createdAt?: Date;
  updatedAt?: Date;
}
