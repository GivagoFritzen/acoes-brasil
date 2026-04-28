import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ValidationError } from "../../shared/validators/OrderValidator";
import { CreateOrUpdatePortfolioDto } from "../dto/CreateOrUpdatePortfolioDto";
import { normalizeOrderCodigo } from "../../../../common/utils/order-codigo.utils";
import { isSupportedB3Ticker } from "../../../../common/utils/asset-type.utils";

export interface CreateOrUpdatePortfolioResult {
  portfolio: PortfolioEntity;
  created: boolean;
}

export class CreateOrUpdatePortfolioUseCase {
  constructor(private portfolioRepository: IPortfolioRepository) {}

  public async executeAsync(dto: CreateOrUpdatePortfolioDto): Promise<CreateOrUpdatePortfolioResult> {
    const codigo = normalizeOrderCodigo(dto.codigo);

    if (!codigo) {
      throw new ValidationError("Dados inválidos para criar/atualizar portfolio.");
    }

    if (!isSupportedB3Ticker(codigo)) {
      throw new ValidationError("Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações.");
    }

    if (!Number.isFinite(dto.quantidade) || dto.quantidade <= 0) {
      throw new ValidationError("Dados inválidos para criar/atualizar portfolio.");
    }

    if (!Number.isFinite(dto.precoMedio) || dto.precoMedio < 0) {
      throw new ValidationError("Dados inválidos para criar/atualizar portfolio.");
    }

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
