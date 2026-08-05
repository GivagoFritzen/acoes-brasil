import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ValidationError } from "../../shared/exceptions/ValidationError";
import { UpdatePortfolioDto } from "../dto/UpdatePortfolioDto";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";

export class UpdatePortfolioService {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  public async executeAsync(id: string, dto: UpdatePortfolioDto) {
    const codigo = normalizeOrderCodigo(dto.codigo);

    if (!codigo) {
      throw new ValidationError("Dados inválidos para atualizar portfolio.");
    }

    if (!isSupportedB3Ticker(codigo)) {
      throw new ValidationError("Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações.");
    }

    if (!Number.isFinite(dto.quantidade) || dto.quantidade <= 0) {
      throw new ValidationError("Dados inválidos para atualizar portfolio.");
    }

    if (!Number.isFinite(dto.precoMedio) || dto.precoMedio < 0) {
      throw new ValidationError("Dados inválidos para atualizar portfolio.");
    }

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