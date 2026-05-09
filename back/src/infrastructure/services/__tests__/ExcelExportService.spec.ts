import { ExcelExportService } from "../ExcelExportService";
import { SellSnapshotExportRow } from "../../models/SellSnapshotExportRow";

describe("ExcelExportService", () => {
  let service: ExcelExportService;

  beforeEach(() => {
    service = new ExcelExportService();
  });

  it("Deve gerar buffer quando dados validos", () => {
    const rows: SellSnapshotExportRow[] = [
      { Data: "2024-01-01", Ativo: "VALE3", "Preço Médio": 50.0, "Quantidade Vendida": 100, "Preço Venda": 60.0, "Custo Médio Total": 5000.0, "Valor Total Venda": 6000.0, "Lucro/Perda": 1000.0 },
    ];

    const buffer = service.generateAsync(rows, "vendas");

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("Deve gerar buffer quando array vazio", () => {
    const rows: SellSnapshotExportRow[] = [];

    const buffer = service.generateAsync(rows, "vendas");

    expect(buffer).toBeInstanceOf(Buffer);
  });
});