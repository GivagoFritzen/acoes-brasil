import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";
import { UpdateProventoDto } from "../dto/UpdateProventoDto";
import { ProventoValidator } from "../../shared/validators/ProventoValidator";

export class UpdateProventoService {
  constructor(private proventoRepository: IProventoRepository) {}

  public async executeAsync(id: string, dto: UpdateProventoDto) {
    const codigo = ProventoValidator.validate(dto);

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