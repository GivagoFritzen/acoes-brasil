import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";

export class DeleteProventoService {
  constructor(private proventoRepository: IProventoRepository) {}

  public async executeAsync(id: string): Promise<void> {
    const provento = await this.proventoRepository.findByIdAsync(id);

    if (!provento) {
      throw new Error("Provento não encontrado.");
    }

    await this.proventoRepository.deleteAsync(id);
  }
}
