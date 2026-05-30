import { ImportOrdersService } from "./ImportOrdersService";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { CreateOrderDto } from "../dto/CreateOrderDto";

describe("ImportOrdersService", () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let orderSellSnapshotRepositoryMock: jest.Mocked<IOrderSellSnapshotRepository>;
  let quoteProviderMock: jest.Mocked<IQuoteProvider>;
  let transactionManagerMock: jest.Mocked<ITransactionManager>;
  let service: ImportOrdersService;

  beforeEach(() => {
    orderRepositoryMock = {
      createAsync: jest.fn().mockResolvedValue({ id: "1" } as any),
      findByIdAsync: jest.fn(),
      findAllByCodigoAsync: jest.fn().mockResolvedValue([]),
      findAllPaginatedAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    portfolioRepositoryMock = {
      createAsync: jest.fn().mockResolvedValue({} as any),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn().mockResolvedValue(null),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn().mockResolvedValue({} as any),
      deleteByCodigoAsync: jest.fn(),
    } as unknown as jest.Mocked<IPortfolioRepository>;

    orderSellSnapshotRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IOrderSellSnapshotRepository>;

    quoteProviderMock = {
      getQuoteAsync: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<IQuoteProvider>;

    transactionManagerMock = {
      executeAsync: jest.fn((fn) => fn(undefined)),
    } as unknown as jest.Mocked<ITransactionManager>;

    service = new ImportOrdersService(
      orderRepositoryMock,
      portfolioRepositoryMock,
      orderSellSnapshotRepositoryMock,
      quoteProviderMock,
      transactionManagerMock,
      new PortfolioDomainService()
    );
  });

  it("Deve importar ordens quando dados validos", async () => {
    const orders: CreateOrderDto[] = [
      { codigo: "VALE3", quantidade: 100, valor: 50.0, data: "01-01-2024", tipo: "ACAO", operacao: "Compra" },
    ];

    const resultado = await service.executeAsync(orders);

    expect(resultado).toBe(1);
    expect(orderRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve lancarr erro quando array vazio", async () => {
    await expect(service.executeAsync([])).rejects.toThrow("Planilha sem dados.");
  });

  it("Deve lancarr erro quando dado obrigatorio faltando", async () => {
    const orders: CreateOrderDto[] = [
      { codigo: "", quantidade: 100, valor: 50.0, data: "01-01-2024", tipo: "ACAO", operacao: "Compra" },
    ];

    await expect(service.executeAsync(orders)).rejects.toThrow();
  });
});