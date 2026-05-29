import { IOrderRepository } from "../interfaces/IOrderRepository";
import { IPortfolioRepository } from "../interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../interfaces/IQuoteProvider";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";

export class PortfolioDomainService {
  async resolveCodigoForPortfolioAsync(codigoBase: string, tx: unknown, portfolioRepository: IPortfolioRepository): Promise<string> {
    const codigo = normalizeOrderCodigo(codigoBase);

    const portfolioPadrao = await portfolioRepository.findByCodigoAsync(codigo, tx);
    if (portfolioPadrao) {
      return portfolioPadrao.codigo;
    }

    return codigo;
  }

  async rebuildPortfolioByCodigoAsync(
    codigo: string,
    tx: unknown,
    orderRepository: IOrderRepository,
    portfolioRepository: IPortfolioRepository
  ): Promise<void> {
    const orders = await orderRepository.findAllByCodigoAsync(codigo, tx);

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

    const portfolio = await portfolioRepository.findByCodigoAsync(codigo, tx);

    if (quantidadeAtual <= 0) {
      if (portfolio) {
        await portfolioRepository.deleteByCodigoAsync(codigo, tx);
      }
      return;
    }

    if (!portfolio) {
      await portfolioRepository.createAsync(
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
    await portfolioRepository.saveAsync(portfolio, tx);
  }

  async updatePortfolioByOrderAsync(
    input: {
      orderId: string;
      codigo: string;
      quantidade: number;
      valor: number;
      operacao: "Compra" | "Venda";
      data: string;
    },
    tx: unknown,
    portfolioRepository: IPortfolioRepository,
    orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    quoteProvider: IQuoteProvider
  ): Promise<void> {
    const { orderId, codigo, quantidade, valor, operacao, data } = input;

    let portfolio = await portfolioRepository.findByCodigoAsync(codigo, tx);

    if (!portfolio) {
      if (operacao === "Venda") {
        throw new Error(`Não é possível vender ativo (${codigo}) que não existe no portfolio.`);
      }

      await portfolioRepository.createAsync(
        {
          codigo,
          quantidade,
          precoMedio: valor,
        },
        tx
      );
      return;
    }

    if (operacao === "Compra") {
      portfolio.registerCompra(quantidade, valor);
      await portfolioRepository.saveAsync(portfolio, tx);
    } else {
      const precoMedioAtual = portfolio.precoMedio;
      portfolio.registerVenda(quantidade);

      const quoteFromFundamentus = await quoteProvider.getQuoteAsync(codigo);
      const valorReferencia = quoteFromFundamentus ?? valor;
      const custoMedioTotal = precoMedioAtual * quantidade;
      const valorReferenciaTotal = valorReferencia * quantidade;
      const ganhos = valorReferenciaTotal - custoMedioTotal;

      if (!Number.isFinite(ganhos)) {
        throw new Error("Não foi possível calcular lucro/prejuízo da venda.");
      }

      const teveLucro = ganhos >= 0;

      await orderSellSnapshotRepository.createAsync(
        {
          orderId,
          codigo,
          precoMedioAtual,
          quantidade,
          valorAtualAcao: valorReferencia,
          ganhos,
          teveLucro,
          data,
        },
        tx
      );

      await portfolioRepository.saveAsync(portfolio, tx);
    }
  }
}
