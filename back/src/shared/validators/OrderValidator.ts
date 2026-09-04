import type { OrderOperacao as orderOperacao, OrderTipo as orderTipo } from "../../../../common/models/order";
import { CreateOrderDto } from "../../application/dto/CreateOrderDto";
import { DateUtils } from "../utils/DateUtils";
import { detectSupportedAssetTypeFromTicker } from "../../../../common/utils/AssetTypeUtils";
import { ValidationError } from "../exceptions/ValidationError";
import { translationService } from "../i18n/TranslationService";

export class OrderValidator {
  static validateCreateOrderDto(dto: CreateOrderDto, lang?: string): void {
    if (!dto.codigo?.trim() || !dto.quantidade || !dto.valor || !dto.data?.trim()) {
      throw new ValidationError(translationService.translate('order.invalidData', lang));
    }

    if (dto.quantidade <= 0) {
      throw new ValidationError(translationService.translate('order.quantityMustBePositive', lang));
    }

    if (dto.valor <= 0) {
      throw new ValidationError(translationService.translate('order.valueMustBePositive', lang));
    }

    if (dto.operacao !== "Compra" && dto.operacao !== "Venda") {
      throw new ValidationError(translationService.translate('order.invalidOperation', lang));
    }
  }

  static validateOrderDate(dateStr: string, lang?: string): void {
    if (DateUtils.isFutureDate(dateStr)) {
      throw new ValidationError(translationService.translate('order.futureDateNotAllowed', lang));
    }
  }

  static parseOperacao(value: string, lang?: string): orderOperacao {
    const operacaoValue = value.trim().toLowerCase();
    if (operacaoValue.includes("compra")) return "Compra";
    if (operacaoValue.includes("venda")) return "Venda";
    throw new ValidationError(translationService.translate('order.invalidOperationType', lang));
  }

  static parseTipo(value: string, lang?: string, codigo?: string): orderTipo {
    if (codigo) {
      const detectedFromCodigo = detectSupportedAssetTypeFromTicker(codigo);
      if (detectedFromCodigo) {
        return detectedFromCodigo;
      }

      throw new ValidationError(translationService.translate('order.invalidCode', lang));
    }

    const tipoValue = value.trim().toLowerCase();
    if (tipoValue.includes("fii") || tipoValue.includes("fundo imobili")) return "FII";
    if (tipoValue.includes("bdr")) return "BDR";

    if (tipoValue.includes("acao") || tipoValue.includes("ação")) return "ACAO";

    throw new ValidationError(translationService.translate('order.couldNotDetectAssetType', lang));
  }
}
