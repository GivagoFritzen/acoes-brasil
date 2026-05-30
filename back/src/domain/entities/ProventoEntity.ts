import type { ProventoTipo as proventoTipo } from "../../../../common/models/provento";

export class ProventoEntity {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly data: string,
    public readonly tipo: proventoTipo,
    public readonly instituicao: string,
    public readonly quantidade: number,
    public readonly precoUnitario: number,
    public readonly valorLiquido: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
