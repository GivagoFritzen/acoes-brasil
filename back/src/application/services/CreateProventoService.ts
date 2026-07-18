import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ValidationError } from "../../shared/exceptions/ValidationError";
import { CreateProventoDto } from "../dto/CreateProventoDto";
import { DateUtils } from "../../shared/utils/DateUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";

export class CreateProventoService {
  constructor(private proventoRepository: IProventoRepository) {}

  public async executeAsync(dto: CreateProventoDto): Promise<ProventoEntity> {
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

    return this.proventoRepository.createAsync({
      codigo,
      data: dto.data,
      tipo: dto.tipo,
      instituicao: dto.instituicao,
      quantidade: dto.quantidade,
      precoUnitario: dto.precoUnitario,
      valorLiquido: dto.valorLiquido,
    });
  }
}
