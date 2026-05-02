import type { ProventoTipo } from "../../../../common/models/provento";

export type { ProventoTipo };

export class ProventoEntity {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly data: string,
    public readonly tipo: ProventoTipo,
    public readonly instituicao: string,
    public readonly quantidade: number,
    public readonly precoUnitario: number,
    public readonly valorLiquido: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
