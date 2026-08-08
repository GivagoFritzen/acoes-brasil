import { ValidationError } from "../exceptions/ValidationError";
import { CreateOrUpdatePortfolioDto } from "../../application/dto/CreateOrUpdatePortfolioDto";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";

export class PortfolioValidator {
  static validate(dto: CreateOrUpdatePortfolioDto): string {
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

    return codigo;
  }
}
