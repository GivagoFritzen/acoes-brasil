import { OrderEntity } from "../../domain/entities/OrderEntity";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { CreateOrderDto } from "../dto/CreateOrderDto";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { OrderValidator } from "../../shared/validators/OrderValidator";

export class CreateOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    private quoteProvider: IQuoteProvider,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) { }

  public async executeAsync(input: CreateOrderDto): Promise<OrderEntity> {
    const { quantidade, valor, operacao, data, tipo } = input;
    const codigoNormalizado = normalizeOrderCodigo(input.codigo);

    OrderValidator.validateCreateOrderDto(input);
    OrderValidator.validateOrderDate(data);

    const quote = await this.quoteProvider.getQuoteAsync(codigoNormalizado);

    return await this.transactionManager.executeAsync(async (tx) => {
      const codigo = await this.portfolioDomainService.resolveCodigoForPortfolioAsync(codigoNormalizado, tx, this.portfolioRepository);

      if (operacao === "Venda") {
        await this.portfolioDomainService.rebuildPortfolioByCodigoAsync(codigo, tx, this.orderRepository, this.portfolioRepository);
      }

      const orderData = {
        codigo,
        quantidade,
        valor,
        data,
        tipo,
        operacao,
      };

      const order = await this.orderRepository.createAsync(orderData, tx);

      await this.portfolioDomainService.updatePortfolioByOrderAsync(
        {
          orderId: order.id,
          codigo,
          quantidade,
          valor,
          operacao,
          data: order.data,
        },
        tx,
        this.portfolioRepository,
        this.orderSellSnapshotRepository,
        quote
      );

      return order;
    });
  }
}
