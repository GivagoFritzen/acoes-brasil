import type { OrderOperacao as orderOperacao, OrderTipo as orderTipo } from "../../../../common/models/order";

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly valor: number,
    public readonly quantidade: number,
    public readonly data: string,
    public readonly tipo: orderTipo,
    public readonly operacao: orderOperacao,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public get isCompra(): boolean {
    return this.operacao === "Compra";
  }

  public get isVenda(): boolean {
    return this.operacao === "Venda";
  }
}
