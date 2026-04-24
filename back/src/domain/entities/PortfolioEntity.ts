export class PortfolioEntity {
  constructor(
    public id: string,
    public codigo: string,
    public quantidade: number,
    public precoMedio: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public registerCompra(quantidade: number, valor: number): void {
    const novaQuantidade = this.quantidade + quantidade;
    const novoPrecoMedio = novaQuantidade > 0
      ? ((this.quantidade * this.precoMedio) + (quantidade * valor)) / novaQuantidade
      : 0;

    this.quantidade = novaQuantidade;
    this.precoMedio = novoPrecoMedio;

  }

  public registerVenda(quantidade: number): void {
    if (quantidade > this.quantidade) {
      throw new Error("Quantidade de venda maior do que a posição atual no portfolio.");
    }

    this.quantidade -= quantidade;
    if (this.quantidade === 0) {
      this.precoMedio = 0;
    }
  }
}
