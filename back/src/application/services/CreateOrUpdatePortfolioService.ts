import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { CreateOrUpdatePortfolioDto } from "../dto/CreateOrUpdatePortfolioDto";
import { CreateOrUpdatePortfolioResult } from "../dto/CreateOrUpdatePortfolioResult";
import { PortfolioValidator } from "../../shared/validators/PortfolioValidator";

export class CreateOrUpdatePortfolioService {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  public async executeAsync(dto: CreateOrUpdatePortfolioDto): Promise<CreateOrUpdatePortfolioResult> {
    const codigo = PortfolioValidator.validate(dto);

    const existing = await this.portfolioRepository.findByCodigoAsync(codigo);

    if (existing) {
      existing.registerCompra(dto.quantidade, dto.precoMedio);
      const updated = await this.portfolioRepository.saveAsync(existing);
      return { portfolio: updated, created: false };
    }

    const created = await this.portfolioRepository.createAsync({
      codigo,
      quantidade: dto.quantidade,
      precoMedio: dto.precoMedio,
    });

    return { portfolio: created, created: true };
  }
}
