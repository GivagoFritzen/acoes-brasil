import { ValidationError } from "../exceptions/ValidationError";
import { CreateProventoDto } from "../../application/dto/CreateProventoDto";
import { DateUtils } from "../utils/DateUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";

export class ProventoValidator {
  static validate(dto: CreateProventoDto): string {
    const codigo = normalizeOrderCodigo(dto.codigo);

    if (!codigo) {
      throw new ValidationError("Dados inválidos para criar provento.");
    }

    if (!isSupportedB3Ticker(codigo)) {
      throw new ValidationError("Código inválido. Use 4 letras + 2 dígitos (máx. 7), com sufixo F apenas para ações.");
    }

    if (!dto.data) {
      throw new ValidationError("Data inválida para provento.");
    }

    if (DateUtils.isFutureDate(dto.data)) {
      throw new ValidationError("A data do provento não pode ser futura.");
    }

    return codigo;
  }
}
