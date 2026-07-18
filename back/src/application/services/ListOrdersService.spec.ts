import { ListOrdersService } from "./ListOrdersService";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPaginatedOrders } from "../../domain/interfaces/IPaginatedOrders";
import { OrderEntity } from "../../domain/entities/OrderEntity";

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
    } as jest.Mocked<IOrderRepository>;

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
        new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"),
      ],
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