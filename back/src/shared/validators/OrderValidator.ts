import { OrderOperacao, OrderTipo } from "../../domain/entities/OrderEntity";
import { CreateOrderDto } from "../../application/dto/CreateOrderDto";
import { detectSupportedAssetTypeFromTicker } from "../../../../common/utils/asset-type.utils";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

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
    if (this.isFutureBrDate(dateStr)) {
      throw new ValidationError("A data da ordem não pode ser futura.");
    }
  }

  private static isFutureBrDate(dateStr: string): boolean {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return false;
    const [day, month, year] = parts;
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    dateObj.setHours(23, 59, 59, 999);
    return dateObj > new Date();
  }

  static parseOperacao(value: string): OrderOperacao {
    const operacaoValue = value.trim().toLowerCase();
    if (operacaoValue.includes("compra")) return "Compra";
    if (operacaoValue.includes("venda")) return "Venda";
    throw new ValidationError("Operação inválida. Use Compra ou Venda.");
  }

  static parseTipo(value: string, codigo?: string): OrderTipo {
    if (codigo) {
      const detectedFromCodigo = detectSupportedAssetTypeFromTicker(codigo);
      if (detectedFromCodigo) {
        return detectedFromCodigo;
      }
    }

    const tipoValue = value.trim().toLowerCase();
    if (tipoValue.includes("fii") || tipoValue.includes("fundo imobili")) return "FII";
    if (tipoValue.includes("bdr")) return "BDR";

    if (tipoValue.includes("acao") || tipoValue.includes("ação")) return "ACAO";

    throw new ValidationError("Não foi possível detectar o tipo do ativo pelo código informado.");
  }

  static normalizeToBrDateString(val: unknown): string {
    if (!val) return "";
    const str = String(val).trim();
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
    const isoFullMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoFullMatch) return `${isoFullMatch[3]}-${isoFullMatch[2]}-${isoFullMatch[1]}`;
    return str;
  }
}
