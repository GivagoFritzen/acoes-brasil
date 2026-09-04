import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { BaseDeleteService } from "./BaseDeleteService";
import { translationService } from "../../shared/i18n/TranslationService";

export class DeletePortfolioService extends BaseDeleteService<PortfolioEntity> {
  constructor(private portfolioRepository: IPortfolioRepository) {
    super();
  }

  protected getNotFoundMessage(lang?: string): string {
    return translationService.translate('portfolio.assetNotFound', lang);
  }

  protected async findEntityAsync(id: string): Promise<PortfolioEntity | null> {
    return this.portfolioRepository.findByIdAsync(id);
  }

  protected async performDeleteAsync(entity: PortfolioEntity): Promise<void> {
    await this.portfolioRepository.deleteByCodigoAsync(entity.codigo);
  }
}
