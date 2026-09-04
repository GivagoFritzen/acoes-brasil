import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";
import { ValidationException } from "../../shared/exceptions/ValidationException";
import { translationService } from "../../shared/i18n/TranslationService";

export class DeleteOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) {}

  public async executeAsync(orderId: string, lang: string, confirmado: boolean = false): Promise<void> {
    return await this.transactionManager.executeAsync(async (tx) => {
      const order = await this.orderRepository.findByIdAsync(orderId, tx);

      if (!order) {
        throw new NotFoundException(translationService.translate('order.notFound', lang));
      }

      if (!confirmado) {
        const validation = await this.portfolioDomainService.validateDeleteOrderAsync(
          orderId,
          lang,
          tx,
          this.orderRepository,
          this.portfolioRepository
        );

        if (validation.hasDivergence) {
          throw new ValidationException(
            translationService.translate('order.divergencesPending', lang, { count: validation.divergences.length })
          );
        }
      }

      const codigo = order.codigo;
      await this.orderRepository.deleteAsync(orderId, tx);
      await this.portfolioDomainService.rebuildPortfolioByCodigoAsync(codigo, tx, this.orderRepository, this.portfolioRepository);
    });
  }
}
