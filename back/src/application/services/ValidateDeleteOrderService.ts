import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { DeleteOrderValidationResult } from "../dto/DeleteOrderValidationResult";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";

export class ValidateDeleteOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) {}

  public async executeAsync(orderId: string): Promise<DeleteOrderValidationResult> {
    return await this.transactionManager.executeAsync(async (tx) => {
      const order = await this.orderRepository.findByIdAsync(orderId, tx);

      if (!order) {
        throw new NotFoundException("Ordem não encontrada.");
      }

      return await this.portfolioDomainService.validateDeleteOrderAsync(
        orderId,
        tx,
        this.orderRepository,
        this.portfolioRepository
      );
    });
  }
}
