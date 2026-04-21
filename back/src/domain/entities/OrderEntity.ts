export type OrderOperacao = "Compra" | "Venda";
export type OrderTipo = "FII" | "BDR" | "ACAO";

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly valor: number,
    public readonly quantidade: number,
    public readonly data: string,
    public readonly tipo: OrderTipo,
    public readonly operacao: OrderOperacao,
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
