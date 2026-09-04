import { ValidationError } from "../exceptions/ValidationError";
import { CreateProventoDto } from "../../application/dto/CreateProventoDto";
import { DateUtils } from "../utils/DateUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { translationService } from "../i18n/TranslationService";

export class ProventoValidator {
  static validate(dto: CreateProventoDto, lang?: string): string {
    const codigo = normalizeOrderCodigo(dto.codigo);

    if (!codigo) {
      throw new ValidationError(translationService.translate('provento.invalidData', lang));
    }

    if (!isSupportedB3Ticker(codigo)) {
      throw new ValidationError(translationService.translate('provento.invalidCode', lang));
    }

    if (!dto.data) {
      throw new ValidationError(translationService.translate('provento.invalidDate', lang));
    }

    if (DateUtils.isFutureDate(dto.data)) {
      throw new ValidationError(translationService.translate('provento.futureDateNotAllowed', lang));
    }

    return codigo;
  }
}
