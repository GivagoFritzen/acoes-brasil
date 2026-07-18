import { GetSellSnapshotsService } from "./GetSellSnapshotsService";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { OrderSellSnapshotEntity } from "../../domain/entities/OrderSellSnapshotEntity";

describe("GetSellSnapshotsService", () => {
  let sellSnapshotRepositoryMock: jest.Mocked<IOrderSellSnapshotRepository>;
  let service: GetSellSnapshotsService;

  beforeEach(() => {
    sellSnapshotRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as jest.Mocked<IOrderSellSnapshotRepository>;

    service = new GetSellSnapshotsService(sellSnapshotRepositoryMock);
  });

  it("Deve retornar lista vazia quando repository retorna array vazio", async () => {
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue([]);

    const resultado = await service.executeAsync();

    expect(resultado).toEqual([]);
  });

  it("Deve retornar snapshots quando repository retorna dados", async () => {
    const snapshotsFakes: OrderSellSnapshotEntity[] = [
      new OrderSellSnapshotEntity("1", "order1", "VALE3", 50.0, 100, 60.0, 1000.0, true, "01-01-2024"),
    ];
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue(snapshotsFakes);

    const resultado = await service.executeAsync();

    expect(resultado).toHaveLength(1);
    expect(resultado[0].codigo).toBe("VALE3");
  });

  it("Deve repassar ano para o repository quando informado", async () => {
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue([]);

    await service.executeAsync("2024");

    expect(sellSnapshotRepositoryMock.findAllAsync).toHaveBeenCalledWith("2024");
  });
});