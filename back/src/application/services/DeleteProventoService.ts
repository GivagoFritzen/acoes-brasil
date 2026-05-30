import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { BaseDeleteService } from "./BaseDeleteService";

export class DeleteProventoService extends BaseDeleteService<ProventoEntity> {
  constructor(private proventoRepository: IProventoRepository) {
    super();
  }

  protected getNotFoundMessage(): string {
    return "provento não encontrado.";
  }

  protected async findEntityAsync(id: string): Promise<ProventoEntity | null> {
    return this.proventoRepository.findByIdAsync(id);
  }

  protected async performDeleteAsync(entity: ProventoEntity): Promise<void> {
    await this.proventoRepository.deleteAsync(entity.id);
  }
}
