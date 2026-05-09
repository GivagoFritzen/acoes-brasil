import { GetSellSnapshotsService } from "../GetSellSnapshotsService";
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
    } as unknown as jest.Mocked<IOrderSellSnapshotRepository>;

    service = new GetSellSnapshotsService(sellSnapshotRepositoryMock);
  });

  it("Deve retornar lista vazia quando repository retorna array vazio", async () => {
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue([]);

    const resultado = await service.executeAsync();

    expect(resultado).toEqual([]);
  });

  it("Deve retornar snapshots quando repository retorna dados", async () => {
    const snapshotsFakes: OrderSellSnapshotEntity[] = [
      { id: "1", codigo: "VALE3", precoMedioAtual: 50.0, quantidade: 100, valorAtualAcao: 60.0, ganhos: 1000.0, data: "2024-01-01", createdAt: new Date(), updatedAt: new Date() },
    ] as unknown as OrderSellSnapshotEntity[];
    sellSnapshotRepositoryMock.findAllAsync.mockResolvedValue(snapshotsFakes);

    const resultado = await service.executeAsync();

    expect(resultado).toHaveLength(1);
    expect(resultado[0].codigo).toBe("VALE3");
  });
});