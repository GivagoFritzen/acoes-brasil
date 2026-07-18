import { ExportSellSnapshotsService } from "./ExportSellSnapshotsService";
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
    } as jest.Mocked<IOrderSellSnapshotRepository>;

    excelExportServiceMock = {
      generateAsync: jest.fn().mockReturnValue(Buffer.from("test")),
    } as jest.Mocked<ExcelExportService>;

    service = new ExportSellSnapshotsService(sellSnapshotRepositoryMock, excelExportServiceMock);
  });

  it("Deve gerar buffer de excel quando snapshots existem", async () => {
    const snapshotsFakes: OrderSellSnapshotEntity[] = [
      new OrderSellSnapshotEntity("1", "order1", "VALE3", 50.0, 100, 60.0, 1000.0, true, "01-01-2024"),
    ];
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue(snapshotsFakes);

    const resultado = await service.executeAsync();

    expect(resultado.buffer).toBeDefined();
    expect(resultado.fileName).toBeDefined();
  });

  it("Deve repassar ano para o repository quando informado", async () => {
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue([]);

    await service.executeAsync("2025");

    expect(sellSnapshotRepositoryMock.findAllAsync).toHaveBeenCalledWith("2025");
  });
});