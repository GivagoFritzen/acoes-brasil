import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { SellSnapshotRow } from "../dto/SellSnapshotRow";

export class GetSellSnapshotsService {
  constructor(private sellSnapshotRepository: IOrderSellSnapshotRepository) {}

  async executeAsync(ano?: string): Promise<SellSnapshotRow[]> {
    const snapshots = await this.sellSnapshotRepository.findAllAsync(ano);
    return snapshots.map((snapshot) => ({
      codigo: snapshot.codigo,
      precoMedioAtual: snapshot.precoMedioAtual,
      quantidade: snapshot.quantidade,
      valorAtualAcao: snapshot.valorAtualAcao,
      ganhos: snapshot.ganhos,
      data: snapshot.data,
    }));
  }
}
