import { ValidationError } from "../exceptions/ValidationError";
import { CreateOrUpdatePortfolioDto } from "../../application/dto/CreateOrUpdatePortfolioDto";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";
import { translationService } from "../i18n/TranslationService";

export class PortfolioValidator {
  static validate(dto: CreateOrUpdatePortfolioDto, lang?: string): string {
    const codigo = normalizeOrderCodigo(dto.codigo);

    if (!codigo) {
      throw new ValidationError(translationService.translate('portfolio.invalidData', lang));
    }

    if (!isSupportedB3Ticker(codigo)) {
      throw new ValidationError(translationService.translate('portfolio.invalidCode', lang));
    }

    if (!Number.isFinite(dto.quantidade) || dto.quantidade <= 0) {
      throw new ValidationError(translationService.translate('portfolio.invalidData', lang));
    }

    if (!Number.isFinite(dto.precoMedio) || dto.precoMedio < 0) {
      throw new ValidationError(translationService.translate('portfolio.invalidData', lang));
    }

    return codigo;
  }
}
