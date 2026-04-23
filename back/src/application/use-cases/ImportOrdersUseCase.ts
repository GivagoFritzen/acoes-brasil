import { CreateOrderDto } from "../dto/CreateOrderDto";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { normalizeOrderCodigo } from "../../../../common/utils/order-codigo.utils";

export class ImportOrdersUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    private quoteProvider: IQuoteProvider,
    private transactionManager: ITransactionManager
  ) {}

  public async executeAsync(orders: CreateOrderDto[]): Promise<number> {
    if (!orders.length) {
      throw new Error("Planilha sem dados.");
    }

    return await this.transactionManager.executeAsync(async (tx) => {
      let imported = 0;

      for (const orderDto of orders) {
        if (!orderDto.codigo || !orderDto.quantidade || !orderDto.valor || !orderDto.data) {
          throw new Error("Dados obrigatórios inválidos para importação de negociação.");
        }

        if (this.isFutureBrDate(orderDto.data)) {
          throw new Error("Data futura não é permitida para negociação.");
        }

        const codigoNormalizado = normalizeOrderCodigo(orderDto.codigo);
        const codigo = await this.resolveCodigoForPortfolioAsync(codigoNormalizado, tx);
        const nomeEmpresa = orderDto.nome ? orderDto.nome.trim() : codigo;

        const orderData = {
          codigo,
          quantidade: orderDto.quantidade,
          valor: orderDto.valor,
          data: orderDto.data,
          tipo: orderDto.tipo,
          operacao: orderDto.operacao,
        };

        const order = await this.orderRepository.createAsync(orderData, tx);

        await this.updatePortfolioByOrderAsync(
          {
            orderId: order.id,
            codigo,
            nome: nomeEmpresa,
            quantidade: order.quantidade,
            valor: order.valor,
            operacao: order.operacao,
            data: order.data,
          },
          tx
        );

        imported++;
      }

      return imported;
    });
  }

  private async resolveCodigoForPortfolioAsync(codigoBase: string, tx: unknown): Promise<string> {
    const codigo = normalizeOrderCodigo(codigoBase);

    const portfolioPadrao = await this.portfolioRepository.findByCodigoAsync(codigo, tx);
    if (portfolioPadrao) {
      return portfolioPadrao.codigo;
    }

    return codigo;
  }

  private isFutureBrDate(dateStr: string): boolean {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return false;
    const [day, month, year] = parts;
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    dateObj.setHours(23, 59, 59, 999);
    return dateObj > new Date();
  }

  private async updatePortfolioByOrderAsync(
    input: {
      orderId: string;
      codigo: string;
      nome: string;
      quantidade: number;
      valor: number;
      operacao: "Compra" | "Venda";
      data: string;
    },
    tx: unknown
  ): Promise<void> {
    const { orderId, codigo, nome, quantidade, valor, operacao, data } = input;

    let portfolio = await this.portfolioRepository.findByCodigoAsync(codigo, tx);

    if (!portfolio) {
      if (operacao === "Venda") {
        throw new Error(`Não é possível vender ativo (${codigo}) que não existe no portfolio.`);
      }

      await this.portfolioRepository.createAsync(
        {
          codigo,
          nome: nome || codigo,
          quantidade,
          precoMedio: valor,
        },
        tx
      );
      return;
    }

    if (operacao === "Compra") {
      portfolio.registerCompra(quantidade, valor, nome);
      await this.portfolioRepository.saveAsync(portfolio, tx);
    } else {
      const precoMedioAtual = portfolio.precoMedio;
      portfolio.registerVenda(quantidade);

      const quoteFromFundamentus = await this.quoteProvider.getQuoteAsync(codigo);
      const valorReferencia = quoteFromFundamentus ?? valor;
      const custoMedioTotal = precoMedioAtual * quantidade;
      const valorReferenciaTotal = valorReferencia * quantidade;
      const ganhos = valorReferenciaTotal - custoMedioTotal;

      if (!Number.isFinite(ganhos)) {
        throw new Error("Não foi possível calcular lucro/prejuízo da venda.");
      }

      const teveLucro = ganhos >= 0;

      await this.orderSellSnapshotRepository.createAsync(
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

      await this.portfolioRepository.saveAsync(portfolio, tx);
    }
  }
}
