import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";

export class DeleteOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private transactionManager: ITransactionManager
  ) {}

  public async executeAsync(orderId: string): Promise<void> {
    return await this.transactionManager.executeAsync(async (tx) => {
      const order = await this.orderRepository.findByIdAsync(orderId, tx);

      if (!order) {
        throw new Error("Ordem não encontrada.");
      }

      const codigo = order.codigo;
      await this.orderRepository.deleteAsync(orderId, tx);
      await this.rebuildPortfolioByCodigoAsync(codigo, tx);
    });
  }

  private async rebuildPortfolioByCodigoAsync(codigo: string, tx: unknown): Promise<void> {
    const orders = await this.orderRepository.findAllByCodigoAsync(codigo, tx);
    
    let quantidadeAtual = 0;
    let precoMedioAtual = 0;

    for (const order of orders) {
      const quantidade = order.quantidade;
      const valor = order.valor;

      if (order.operacao === "Compra") {
        const novaQuantidade = quantidadeAtual + quantidade;
        precoMedioAtual =
          novaQuantidade > 0
            ? (quantidadeAtual * precoMedioAtual + quantidade * valor) / novaQuantidade
            : 0;
        quantidadeAtual = novaQuantidade;
        continue;
      }

      quantidadeAtual -= quantidade;

      if (quantidadeAtual < 0) {
        throw new Error("A remoção da ordem deixaria o portfolio inconsistente.");
      }

      if (quantidadeAtual === 0) {
        precoMedioAtual = 0;
      }
    }

    const portfolio = await this.portfolioRepository.findByCodigoAsync(codigo, tx);

    if (quantidadeAtual <= 0) {
      if (portfolio) {
        await this.portfolioRepository.deleteByCodigoAsync(codigo, tx);
      }
      return;
    }

    if (!portfolio) {
      await this.portfolioRepository.createAsync(
        {
          codigo,
          quantidade: quantidadeAtual,
          precoMedio: precoMedioAtual,
        },
        tx
      );
      return;
    }

    portfolio.quantidade = quantidadeAtual;
    portfolio.precoMedio = precoMedioAtual;
    await this.portfolioRepository.saveAsync(portfolio, tx);
  }
}
