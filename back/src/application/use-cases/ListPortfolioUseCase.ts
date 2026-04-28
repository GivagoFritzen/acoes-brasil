import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";

export class ListPortfolioUseCase {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  public async executeAsync(): Promise<PortfolioEntity[]> {
    return this.portfolioRepository.findAllAsync();
  }
}
