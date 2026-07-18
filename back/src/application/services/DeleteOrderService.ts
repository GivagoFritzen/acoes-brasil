import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";

export class DeleteOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) {}

  public async executeAsync(orderId: string): Promise<void> {
    return await this.transactionManager.executeAsync(async (tx) => {
      const order = await this.orderRepository.findByIdAsync(orderId, tx);

      if (!order) {
        throw new NotFoundException("Ordem não encontrada.");
      }

      const codigo = order.codigo;
      await this.orderRepository.deleteAsync(orderId, tx);
      await this.portfolioDomainService.rebuildPortfolioByCodigoAsync(codigo, tx, this.orderRepository, this.portfolioRepository);
    });
  }
}
