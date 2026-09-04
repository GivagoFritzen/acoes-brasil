import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";
import { UpdateProventoDto } from "../dto/UpdateProventoDto";
import { ProventoValidator } from "../../shared/validators/ProventoValidator";
import { translationService } from "../../shared/i18n/TranslationService";

export class UpdateProventoService {
  constructor(private proventoRepository: IProventoRepository) {}

  public async executeAsync(id: string, dto: UpdateProventoDto, lang?: string) {
    const codigo = ProventoValidator.validate(dto, lang);

    const existing = await this.proventoRepository.findByIdAsync(id);

    if (!existing) {
      throw new NotFoundException(translationService.translate('provento.notFound', lang));
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
