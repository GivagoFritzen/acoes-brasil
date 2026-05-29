import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { BaseDeleteService } from "./BaseDeleteService";

export class DeletePortfolioService extends BaseDeleteService<PortfolioEntity> {
  constructor(private portfolioRepository: IPortfolioRepository) {
    super();
  }

  protected getNotFoundMessage(): string {
    return "Ativo do portfólio não encontrado.";
  }

  protected async findEntityAsync(id: string): Promise<PortfolioEntity | null> {
    return this.portfolioRepository.findByIdAsync(id);
  }

  protected async performDeleteAsync(entity: PortfolioEntity): Promise<void> {
    await this.portfolioRepository.deleteByCodigoAsync(entity.codigo);
  }
}
