export class OrderSellSnapshotEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly codigo: string,
    public readonly precoMedioAtual: number,
    public readonly quantidade: number,
    public readonly valorAtualAcao: number,
    public readonly ganhos: number,
    public readonly teveLucro: boolean,
    public readonly data: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
