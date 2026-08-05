import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { UpdateOrderDto } from "../dto/UpdateOrderDto";
import { DateUtils } from "../../shared/utils/DateUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { ValidationException } from "../../shared/exceptions/ValidationException";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";

export class UpdateOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    private quoteProvider: IQuoteProvider,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) { }

  public async executeAsync(orderId: string, input: UpdateOrderDto) {
    const { quantidade, valor, operacao, data, tipo } = input;
    const codigoNormalizado = normalizeOrderCodigo(input.codigo);

    if (!codigoNormalizado || !quantidade || !valor || !data) {
      throw new ValidationException("Dados inválidos para atualizar ordem. Informe código, quantidade, valor e data.");
    }

    if (DateUtils.isFutureDate(data)) {
      throw new ValidationException("A data da ordem não pode ser futura.");
    }

    if (operacao !== "Compra" && operacao !== "Venda") {
      throw new ValidationException("Operação inválida para portfolio. Use Compra ou Venda.");
    }

    const existingOrder = await this.orderRepository.findByIdAsync(orderId);

    if (!existingOrder) {
      throw new NotFoundException("Ordem não encontrada.");
    }

    const quote = await this.quoteProvider.getQuoteAsync(codigoNormalizado);

    return await this.transactionManager.executeAsync(async (tx) => {
      const codigo = await this.portfolioDomainService.resolveCodigoForPortfolioAsync(codigoNormalizado, tx, this.portfolioRepository);

      await this.orderRepository.deleteAsync(orderId, tx);
      await this.portfolioDomainService.rebuildPortfolioByCodigoAsync(codigo, tx, this.orderRepository, this.portfolioRepository);

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