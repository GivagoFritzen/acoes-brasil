import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ValidationError } from "../../shared/exceptions/ValidationError";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";
import { UpdateProventoDto } from "../dto/UpdateProventoDto";
import { DateUtils } from "../../shared/utils/DateUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";

export class UpdateProventoService {
  constructor(private proventoRepository: IProventoRepository) {}

  public async executeAsync(id: string, dto: UpdateProventoDto) {
    const codigo = normalizeOrderCodigo(dto.codigo);

    if (!codigo) {
      throw new ValidationError("Dados inválidos para atualizar provento.");
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

    const existing = await this.proventoRepository.findByIdAsync(id);

    if (!existing) {
      throw new NotFoundException("Provento não encontrado.");
    }

    await this.proventoRepository.deleteAsync(id);
    const updated = await this.proventoRepository.createAsync({
      codigo,
      data: dto.data,
      tipo: dto.tipo,
      instituicao: dto.instituicao,
      quantidade: dto.quantidade,
      precoUnitario: dto.precoUnitario,
      valorLiquido: dto.valorLiquido,
    });

    return updated;
  }
}