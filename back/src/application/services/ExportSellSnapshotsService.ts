import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { ExcelExportService } from "../../infrastructure/services/ExcelExportService";
import { SellSnapshotExportRow } from "../../models/SellSnapshotExportRow";
import { DateUtils } from "../../shared/utils/DateUtils";

export class ExportSellSnapshotsService {
  constructor(
    private sellSnapshotRepository: IOrderSellSnapshotRepository,
    private ExcelExportService: ExcelExportService
  ) {}

  async executeAsync(ano?: string): Promise<{ buffer: Buffer; fileName: string }> {
    const snapshots = await this.sellSnapshotRepository.findAllAsync(ano);

    const rows: SellSnapshotExportRow[] = snapshots.map((snapshot) => {
      const custoMedioTotal = snapshot.precoMedioAtual * snapshot.quantidade;
      const valorVendaTotal = snapshot.valorAtualAcao * snapshot.quantidade;
      let ganhos = snapshot.ganhos;
      if (ganhos === 0) ganhos = valorVendaTotal - custoMedioTotal;

      return {
        Data: snapshot.data,
        Ativo: snapshot.codigo,
        "Preço Médio": snapshot.precoMedioAtual,
        "Quantidade Vendida": snapshot.quantidade,
        "Preço Venda": snapshot.valorAtualAcao,
        "Custo Médio Total": custoMedioTotal,
        "Valor Total Venda": valorVendaTotal,
        "Lucro/Perda": ganhos,
      };
    });

    const fileName = DateUtils.generateFileName("vendas");
    const buffer = this.ExcelExportService.generateAsync(rows);

    return { buffer, fileName };
  }
}
