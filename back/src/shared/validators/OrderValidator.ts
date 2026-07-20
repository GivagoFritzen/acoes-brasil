import type { OrderOperacao as orderOperacao, OrderTipo as orderTipo } from "../../../../common/models/order";
import { CreateOrderDto } from "../../application/dto/CreateOrderDto";
import { DateUtils } from "../utils/DateUtils";
import { detectSupportedAssetTypeFromTicker } from "../../../../common/utils/AssetTypeUtils";
import { ValidationError } from "../exceptions/ValidationError";
export class OrderValidator {
  static validateCreateOrderDto(dto: CreateOrderDto): void {
    if (!dto.codigo?.trim() || !dto.quantidade || !dto.valor || !dto.data?.trim()) {
      throw new ValidationError("Dados inválidos para criar order. Informe código, quantidade, valor e data.");
    }

    if (dto.quantidade <= 0) {
      throw new ValidationError("Quantidade deve ser maior que zero.");
    }

    if (dto.valor <= 0) {
      throw new ValidationError("Valor deve ser maior que zero.");
    }

    if (dto.operacao !== "Compra" && dto.operacao !== "Venda") {
      throw new ValidationError("Operação inválida para portfolio. Use Compra ou Venda.");
    }
  }

  static validateOrderDate(dateStr: string): void {
    if (DateUtils.isFutureDate(dateStr)) {
      throw new ValidationError("A data da ordem não pode ser futura.");
    }
  }

  static parseOperacao(value: string): orderOperacao {
    const operacaoValue = value.trim().toLowerCase();
    if (operacaoValue.includes("compra")) return "Compra";
    if (operacaoValue.includes("venda")) return "Venda";
    throw new ValidationError("Operação inválida. Use Compra ou Venda.");
  }

  static parseTipo(value: string, codigo?: string): orderTipo {
    if (codigo) {
      const detectedFromCodigo = detectSupportedAssetTypeFromTicker(codigo);
      if (detectedFromCodigo) {
        return detectedFromCodigo;
      }

      throw new ValidationError("Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações.");
    }

    const tipoValue = value.trim().toLowerCase();
    if (tipoValue.includes("fii") || tipoValue.includes("fundo imobili")) return "FII";
    if (tipoValue.includes("bdr")) return "BDR";

    if (tipoValue.includes("acao") || tipoValue.includes("ação")) return "ACAO";

    throw new ValidationError("Não foi possível detectar o tipo do ativo pelo código informado.");
  }
}
