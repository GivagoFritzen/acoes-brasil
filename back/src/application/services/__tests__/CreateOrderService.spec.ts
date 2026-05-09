import { CreateOrderService } from "../CreateOrderService";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { OrderEntity, OrderTipo, OrderOperacao } from "../../domain/entities/OrderEntity";

describe("CreateOrderService", () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let orderSellSnapshotRepositoryMock: jest.Mocked<IOrderSellSnapshotRepository>;
  let quoteProviderMock: jest.Mocked<IQuoteProvider>;
  let transactionManagerMock: jest.Mocked<ITransactionManager>;
  let service: CreateOrderService;

  const tipoValido: OrderTipo = "ACAO";
  const operacaoCompra: OrderOperacao = "Compra";

  beforeEach(() => {
    orderRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllByCodigoAsync: jest.fn(),
      findAllPaginatedAsync: jest.fn(),
      deleteAsync: jest.fn(),
      countAsync: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as unknown as jest.Mocked<IPortfolioRepository>;

    orderSellSnapshotRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IOrderSellSnapshotRepository>;

    quoteProviderMock = {
      getQuoteAsync: jest.fn(),
    } as unknown as jest.Mocked<IQuoteProvider>;

    transactionManagerMock = {
      executeAsync: jest.fn((fn) => fn(undefined)),
    } as unknown as jest.Mocked<ITransactionManager>;

    service = new CreateOrderService(
      orderRepositoryMock,
      portfolioRepositoryMock,
      orderSellSnapshotRepositoryMock,
      quoteProviderMock,
      transactionManagerMock
    );
  });

  it("Deve criar ordem de compra quando dados validos", async () => {
    const ordemCriada: OrderEntity = {
      id: "1",
      codigo: "VALE3",
      quantidade: 100,
      valor: 50.0,
      data: "2024-01-01",
      tipo: "ACAO",
      operacao: "Compra",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as OrderEntity;
    orderRepositoryMock.createAsync.mockResolvedValue(ordemCriada);
    portfolioRepositoryMock.createAsync.mockResolvedValue({} as any);

    const resultado = await service.executeAsync({
      codigo: "VALE3",
      quantidade: 100,
      valor: 50.0,
      data: "2024-01-01",
      tipo: tipoValido,
      operacao: operacaoCompra,
    });

    expect(resultado).toBeDefined();
    expect(orderRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve lancar erro quando dados invalidos", async () => {
    await expect(
      service.executeAsync({
        codigo: "",
        quantidade: 0,
        valor: 0,
        data: "",
        tipo: "ACAO" as any,
        operacao: "" as any,
      })
    ).rejects.toThrow();
  });

  it("Deve lancar erro quando operacao invalida", async () => {
    await expect(
      service.executeAsync({
        codigo: "VALE3",
        quantidade: 100,
        valor: 50.0,
        data: "2024-01-01",
        tipo: tipoValido,
        operacao: "TipoInvalido" as any,
      })
    ).rejects.toThrow();
  });

  it("Deve lancar erro quando data futura", async () => {
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);

    await expect(
      service.executeAsync({
        codigo: "VALE3",
        quantidade: 100,
        valor: 50.0,
        data: dataFutura.toISOString().split("T")[0],
        tipo: tipoValido,
        operacao: operacaoCompra,
      })
    ).rejects.toThrow();
  });
});