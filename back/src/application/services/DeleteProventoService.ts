import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { BaseDeleteService } from "./BaseDeleteService";
import { translationService } from "../../shared/i18n/TranslationService";

export class DeleteProventoService extends BaseDeleteService<ProventoEntity> {
  constructor(private proventoRepository: IProventoRepository) {
    super();
  }

  protected getNotFoundMessage(lang?: string): string {
    return translationService.translate('provento.notFound', lang);
  }

  protected async findEntityAsync(id: string): Promise<ProventoEntity | null> {
    return this.proventoRepository.findByIdAsync(id);
  }

  protected async performDeleteAsync(entity: ProventoEntity): Promise<void> {
    await this.proventoRepository.deleteAsync(entity.id);
  }

  public async executeByCodigoAsync(codigo: string): Promise<void> {
    await this.proventoRepository.deleteByCodigoAsync(codigo);
  }
}
