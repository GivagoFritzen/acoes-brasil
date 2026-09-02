import { IOrderRepository } from "../interfaces/IOrderRepository";
import { IPortfolioRepository } from "../interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../interfaces/IOrderSellSnapshotRepository";
import { SellDivergence } from "../../application/dto/SellDivergence";
import { SellValidationResult } from "../../application/dto/SellValidationResult";
import { DeleteOrderValidationResult } from "../../application/dto/DeleteOrderValidationResult";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { BusinessException } from "../../shared/exceptions/BusinessException";

export class PortfolioDomainService {
  async resolveCodigoForPortfolioAsync(codigoBase: string, tx: object | undefined, portfolioRepository: IPortfolioRepository): Promise<string> {
    const codigo = normalizeOrderCodigo(codigoBase);

    const portfolioPadrao = await portfolioRepository.findByCodigoAsync(codigo, tx);
    if (portfolioPadrao) {
      return portfolioPadrao.codigo;
    }

    return codigo;
  }

  async rebuildPortfolioByCodigoAsync(
    codigo: string,
    tx: object | undefined,
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

      if (quantidadeAtual <= 0) {
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

  async validateSellAsync(
    codigo: string,
    quantidade: number,
    tx: object | undefined,
    portfolioRepository: IPortfolioRepository
  ): Promise<SellValidationResult> {
    const portfolio = await portfolioRepository.findByCodigoAsync(codigo, tx);

    if (!portfolio) {
      return {
        hasDivergence: true,
        divergence: {
          codigo,
          operacao: "Venda",
          quantidade,
          quantidadeDisponivel: 0,
          mensagem: `Ativo ${codigo} vendido sem existir no portfólio`,
        },
      };
    }

    const quantidadeResultante = portfolio.quantidade - quantidade;

    if (quantidadeResultante < 1) {
      return {
        hasDivergence: true,
        divergence: {
          codigo,
          operacao: "Venda",
          quantidade,
          quantidadeDisponivel: portfolio.quantidade,
          mensagem: `Ativo ${codigo} vendido deixaria portfólio com quantidade ${quantidadeResultante} (mínimo 1)`,
        },
      };
    }

    return { hasDivergence: false };
  }

  async validateDeleteOrderAsync(
    orderId: string,
    tx: object | undefined,
    orderRepository: IOrderRepository,
    portfolioRepository: IPortfolioRepository
  ): Promise<DeleteOrderValidationResult> {
    const order = await orderRepository.findByIdAsync(orderId, tx);
    if (!order) {
      return { hasDivergence: false, divergences: [] };
    }

    const codigo = order.codigo;
    const allOrders = await orderRepository.findAllByCodigoAsync(codigo, tx);
    const remainingOrders = allOrders.filter(o => o.id !== orderId);

    let quantidadeAtual = 0;
    for (const o of remainingOrders) {
      if (o.operacao === "Compra") {
        quantidadeAtual += o.quantidade;
      } else {
        quantidadeAtual -= o.quantidade;
      }
    }

    const portfolio = await portfolioRepository.findByCodigoAsync(codigo, tx);
    const divergences: SellDivergence[] = [];

    if (quantidadeAtual < 0) {
      divergences.push({
        codigo,
        operacao: order.operacao,
        quantidade: order.quantidade,
        quantidadeDisponivel: portfolio?.quantidade ?? 0,
        mensagem: `Remover esta ordem deixaria o portfólio com quantidade ${quantidadeAtual} (mínimo 1)`,
      });
    }

    if (quantidadeAtual === 0 && !portfolio) {
      divergences.push({
        codigo,
        operacao: order.operacao,
        quantidade: order.quantidade,
        quantidadeDisponivel: 0,
        mensagem: `Ativo ${codigo} não existe no portfólio`,
      });
    }

    return {
      hasDivergence: divergences.length > 0,
      divergences,
    };
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
    tx: object | undefined,
    portfolioRepository: IPortfolioRepository,
    orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    quote?: number | null,
    skipSave: boolean = false
  ): Promise<{ warning?: string }> {
    const { orderId, codigo, quantidade, valor, operacao, data } = input;

    const portfolio = await portfolioRepository.findByCodigoAsync(codigo, tx);

    if (!portfolio) {
      if (operacao === "Venda") {
        return { warning: `Ativo ${codigo} vendido sem existir no portfólio` };
      }

      if (!skipSave) {
        await portfolioRepository.createAsync(
          {
            codigo,
            quantidade,
            precoMedio: valor,
          },
          tx
        );
      }
      return {};
    }

    if (operacao === "Compra") {
      await this.processCompra(portfolio, quantidade, valor, skipSave, portfolioRepository, tx);
    } else {
      await this.processVenda(
        { orderId, codigo, quantidade, valor, data },
        portfolio,
        skipSave,
        portfolioRepository,
        orderSellSnapshotRepository,
        quote,
        tx
      );
    }

    return {};
  }

  private async processCompra(
    portfolio: any,
    quantidade: number,
    valor: number,
    skipSave: boolean,
    portfolioRepository: IPortfolioRepository,
    tx: object | undefined
  ): Promise<void> {
    if (skipSave) {
      return;
    }

    portfolio.registerCompra(quantidade, valor);
    await portfolioRepository.saveAsync(portfolio, tx);
  }

  private calculateSellGains(precoMedioAtual: number, quantidade: number, valor: number, quote?: number | null): number {
    const valorReferencia = quote ?? valor;
    const custoMedioTotal = precoMedioAtual * quantidade;
    const valorReferenciaTotal = valorReferencia * quantidade;
    const ganhos = valorReferenciaTotal - custoMedioTotal;

    if (!Number.isFinite(ganhos)) {
      throw new BusinessException("Não foi possível calcular lucro/prejuízo da venda.");
    }

    return ganhos;
  }

  private async processVenda(
    input: {
      orderId: string;
      codigo: string;
      quantidade: number;
      valor: number;
      data: string;
    },
    portfolio: any,
    skipSave: boolean,
    portfolioRepository: IPortfolioRepository,
    orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    quote?: number | null,
    tx?: object | undefined
  ): Promise<void> {
    const { orderId, codigo, quantidade, valor, data } = input;
    const precoMedioAtual = portfolio.precoMedio;

    if (!skipSave) {
      portfolio.registerVenda(quantidade);
    }

    const ganhos = this.calculateSellGains(precoMedioAtual, quantidade, valor, quote);
    const valorReferencia = quote ?? valor;
    const teveLucro = ganhos >= 0;

    if (!skipSave) {
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
