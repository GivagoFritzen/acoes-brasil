import { DeleteOrderService } from "./DeleteOrderService";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { OrderEntity } from "../../domain/entities/OrderEntity";

describe("DeleteOrderService", () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let transactionManagerMock: jest.Mocked<ITransactionManager>;
  let service: DeleteOrderService;

  beforeEach(() => {
    orderRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllByCodigoAsync: jest.fn(),
      findAllPaginatedAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as unknown as jest.Mocked<IPortfolioRepository>;

    transactionManagerMock = {
      executeAsync: jest.fn((fn) => fn(undefined)),
    } as unknown as jest.Mocked<ITransactionManager>;

    service = new DeleteOrderService(
      orderRepositoryMock,
      portfolioRepositoryMock,
      transactionManagerMock,
      new PortfolioDomainService()
    );
  });

  it("Deve excluir ordem quando existe", async () => {
    const ordem: OrderEntity = {
      id: "1",
      codigo: "VALE3",
      quantidade: 100,
      valor: 50.0,
      data: "2024-01-01",
      tipo: "ordinario",
      operacao: "Compra",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as OrderEntity;
    orderRepositoryMock.findByIdAsync.mockResolvedValue(ordem);
    orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue([]);
    orderRepositoryMock.deleteAsync.mockResolvedValue();

    await service.executeAsync("1");

    expect(orderRepositoryMock.deleteAsync).toHaveBeenCalledWith("1", undefined);
  });

  it("Deve lancar erro quando ordem nao existe", async () => {
    orderRepositoryMock.findByIdAsync.mockResolvedValue(null);

    await expect(service.executeAsync("999")).rejects.toThrow("Ordem não encontrada.");
  });

  it("Deve deletar portfolio quando ultima ordem for removida", async () => {
    const ordem: OrderEntity = {
      id: "1",
      codigo: "VALE3",
      quantidade: 100,
      valor: 50.0,
      data: "2024-01-01",
      tipo: "ordinario",
      operacao: "Compra",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as OrderEntity;
    orderRepositoryMock.findByIdAsync.mockResolvedValue(ordem);
    orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue([]);
    orderRepositoryMock.deleteAsync.mockResolvedValue();
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue({} as any);
    portfolioRepositoryMock.deleteByCodigoAsync.mockResolvedValue();

    await service.executeAsync("1");

    expect(portfolioRepositoryMock.deleteByCodigoAsync).toHaveBeenCalled();
  });
});