import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ValidationError } from "../../shared/exceptions/ValidationError";
import { UpdatePortfolioDto } from "../dto/UpdatePortfolioDto";
import { PortfolioValidator } from "../../shared/validators/PortfolioValidator";

export class UpdatePortfolioService {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  public async executeAsync(id: string, dto: UpdatePortfolioDto) {
    const codigo = PortfolioValidator.validate(dto);

    const existing = await this.portfolioRepository.findByIdAsync(id);

    if (!existing) {
      throw new ValidationError("Portfolio não encontrado.");
    }

    existing.codigo = codigo;
    existing.quantidade = dto.quantidade;
    existing.precoMedio = dto.precoMedio;

    const updated = await this.portfolioRepository.saveAsync(existing);
    return updated;
  }
}