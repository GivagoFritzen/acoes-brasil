import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ValidationError } from "../../shared/exceptions/ValidationError";
import { UpdatePortfolioDto } from "../dto/UpdatePortfolioDto";
import { PortfolioValidator } from "../../shared/validators/PortfolioValidator";
import { translationService } from "../../shared/i18n/TranslationService";

export class UpdatePortfolioService {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  public async executeAsync(id: string, dto: UpdatePortfolioDto, lang?: string) {
    const codigo = PortfolioValidator.validate(dto, lang);

    const existing = await this.portfolioRepository.findByIdAsync(id);

    if (!existing) {
      throw new ValidationError(translationService.translate('portfolio.portfolioNotFound', lang));
    }

    existing.codigo = codigo;
    existing.quantidade = dto.quantidade;
    existing.precoMedio = dto.precoMedio;

    const updated = await this.portfolioRepository.saveAsync(existing);
    return updated;
  }
}
