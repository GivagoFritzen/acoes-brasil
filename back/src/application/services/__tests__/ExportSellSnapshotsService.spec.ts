import { ExportSellSnapshotsService } from "../ExportSellSnapshotsService";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { ExcelExportService } from "../../infrastructure/services/ExcelExportService";
import { OrderSellSnapshotEntity } from "../../domain/entities/OrderSellSnapshotEntity";

describe("ExportSellSnapshotsService", () => {
  let sellSnapshotRepositoryMock: jest.Mocked<IOrderSellSnapshotRepository>;
  let excelExportServiceMock: jest.Mocked<ExcelExportService>;
  let service: ExportSellSnapshotsService;

  beforeEach(() => {
    sellSnapshotRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IOrderSellSnapshotRepository>;

    excelExportServiceMock = {
      generateAsync: jest.fn().mockReturnValue(Buffer.from("test")),
    } as unknown as jest.Mocked<ExcelExportService>;

    service = new ExportSellSnapshotsService(sellSnapshotRepositoryMock, excelExportServiceMock);
  });

  it("Deve gerar buffer de excel quando snapshots existem", async () => {
    const snapshotsFakes: OrderSellSnapshotEntity[] = [
      { id: "1", codigo: "VALE3", precoMedioAtual: 50.0, quantidade: 100, valorAtualAcao: 60.0, ganhos: 1000.0, data: "2024-01-01", createdAt: new Date(), updatedAt: new Date() },
    ] as unknown as OrderSellSnapshotEntity[];
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue(snapshotsFakes);

    const resultado = await service.executeAsync();

    expect(resultado.buffer).toBeDefined();
    expect(resultado.fileName).toBeDefined();
  });
});