import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { DeleteOrderValidationResult } from "../dto/DeleteOrderValidationResult";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";

export class ValidateDeleteOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) {}

  public async executeAsync(orderId: string, lang?: string): Promise<DeleteOrderValidationResult> {
    return await this.transactionManager.executeAsync(async (tx) => {
      return await this.portfolioDomainService.validateDeleteOrderAsync(
        orderId,
        lang ?? 'pt-BR',
        tx,
        this.orderRepository,
        this.portfolioRepository
      );
    });
  }
}
