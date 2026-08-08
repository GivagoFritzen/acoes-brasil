import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { CreateProventoDto } from "../dto/CreateProventoDto";
import { ProventoValidator } from "../../shared/validators/ProventoValidator";

export class CreateProventoService {
  constructor(private proventoRepository: IProventoRepository) {}

  public async executeAsync(dto: CreateProventoDto): Promise<ProventoEntity> {
    const codigo = ProventoValidator.validate(dto);

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
