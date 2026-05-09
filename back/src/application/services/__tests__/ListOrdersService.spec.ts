import { ListOrdersService } from "../ListOrdersService";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IOrderFilters } from "../../domain/interfaces/IOrderFilters";
import { IPaginatedOrders } from "../../domain/interfaces/IPaginatedOrders";

describe("ListOrdersService", () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let service: ListOrdersService;

  beforeEach(() => {
    orderRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllByCodigoAsync: jest.fn(),
      findAllPaginatedAsync: jest.fn(),
      deleteAsync: jest.fn(),
      countAsync: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    service = new ListOrdersService(orderRepositoryMock);
  });

  it("Deve retornar resultado paginado quando filtros vazios", async () => {
    const resultadoFake: IPaginatedOrders = {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    };
    orderRepositoryMock.findAllPaginatedAsync.mockResolvedValue(resultadoFake);

    const resultado = await service.executeAsync({});

    expect(resultado.page).toBe(1);
    expect(resultado.limit).toBe(20);
    expect(orderRepositoryMock.findAllPaginatedAsync).toHaveBeenCalledWith({}, 1, 20);
  });

  it("Deve usar pagina minima 1 quando page menor que 1", async () => {
    const resultadoFake: IPaginatedOrders = {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    };
    orderRepositoryMock.findAllPaginatedAsync.mockResolvedValue(resultadoFake);

    await service.executeAsync({}, 0, 5);

    expect(orderRepositoryMock.findAllPaginatedAsync).toHaveBeenCalledWith({}, 1, 5);
  });

  it("Deve usar limite minimo 1 quando limit menor que 1", async () => {
    const resultadoFake: IPaginatedOrders = {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    };
    orderRepositoryMock.findAllPaginatedAsync.mockResolvedValue(resultadoFake);

    await service.executeAsync({}, 1, 0);

    expect(orderRepositoryMock.findAllPaginatedAsync).toHaveBeenCalledWith({}, 1, 1);
  });

  it("Deve retornar dados quando repository retorna ordens", async () => {
    const resultadoFake: IPaginatedOrders = {
      data: [
        { id: "1", codigo: "VALE3", quantidade: 100, valor: 50.0, data: "2024-01-01", tipo: " Ordinário", operacao: "Compra", createdAt: new Date(), updatedAt: new Date() },
      ] as unknown as any[],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    };
    orderRepositoryMock.findAllPaginatedAsync.mockResolvedValue(resultadoFake);

    const resultado = await service.executeAsync({});

    expect(resultado.data).toHaveLength(1);
  });
});