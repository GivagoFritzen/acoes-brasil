import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";

export interface SellSnapshotRow {
  codigo: string;
  precoMedioAtual: number;
  quantidade: number;
  valorAtualAcao: number;
  ganhos: number;
  data: string;
}

export class GetSellSnapshotsUseCase {
  constructor(private sellSnapshotRepository: IOrderSellSnapshotRepository) {}

  async executeAsync(): Promise<SellSnapshotRow[]> {
    const snapshots = await this.sellSnapshotRepository.findAllAsync();
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
