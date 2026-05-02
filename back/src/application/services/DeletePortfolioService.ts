import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";

export class DeletePortfolioService {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  public async executeAsync(id: string): Promise<void> {
    const portfolio = await this.portfolioRepository.findByIdAsync(id);

    if (!portfolio) {
      throw new Error("Ativo do portfólio não encontrado.");
    }

    await this.portfolioRepository.deleteByCodigoAsync(portfolio.codigo);
  }
}
