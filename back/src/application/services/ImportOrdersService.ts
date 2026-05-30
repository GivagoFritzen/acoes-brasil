import { CreateOrderDto } from "../dto/CreateOrderDto";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { DateUtils } from "../../shared/utils/DateUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";

export class ImportOrdersService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    private quoteProvider: IQuoteProvider,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
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

        if (DateUtils.isFutureBrDate(orderDto.data)) {
          throw new Error("Data futura não é permitida para negociação.");
        }

        const codigoNormalizado = normalizeOrderCodigo(orderDto.codigo);
        const codigo = await this.portfolioDomainService.resolveCodigoForPortfolioAsync(codigoNormalizado, tx, this.portfolioRepository);
        const orderData = {
          codigo,
          quantidade: orderDto.quantidade,
          valor: orderDto.valor,
          data: orderDto.data,
          tipo: orderDto.tipo,
          operacao: orderDto.operacao,
        };

        const order = await this.orderRepository.createAsync(orderData, tx);

        await this.portfolioDomainService.updatePortfolioByOrderAsync(
          {
            orderId: order.id,
            codigo,
            quantidade: order.quantidade,
            valor: order.valor,
            operacao: order.operacao,
            data: order.data,
          },
          tx,
          this.portfolioRepository,
          this.orderSellSnapshotRepository,
          this.quoteProvider
        );

        imported++;
      }

      return imported;
    });
  }
}
