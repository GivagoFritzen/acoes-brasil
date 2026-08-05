import { UpdateOrderService } from "./UpdateOrderService";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { OrderEntity } from "../../domain/entities/OrderEntity";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";
import type { OrderTipo as orderTipo, OrderOperacao as orderOperacao } from "../../../../common/models/order";

describe("UpdateOrderService", () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let orderSellSnapshotRepositoryMock: jest.Mocked<IOrderSellSnapshotRepository>;
  let quoteProviderMock: jest.Mocked<IQuoteProvider>;
  let transactionManagerMock: jest.Mocked<ITransactionManager>;
  let service: UpdateOrderService;

  const tipoValido: orderTipo = "ACAO";
  const operacaoCompra: orderOperacao = "Compra";

  beforeEach(() => {
    orderRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllByCodigoAsync: jest.fn(),
      findAllPaginatedAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as jest.Mocked<IOrderRepository>;

    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as jest.Mocked<IPortfolioRepository>;

    orderSellSnapshotRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as jest.Mocked<IOrderSellSnapshotRepository>;

    quoteProviderMock = {
      getQuoteAsync: jest.fn().mockResolvedValue(null),
    } as jest.Mocked<IQuoteProvider>;

    transactionManagerMock = {
      executeAsync: jest.fn((fn) => fn(undefined)),
    } as jest.Mocked<ITransactionManager>;

    service = new UpdateOrderService(
      orderRepositoryMock,
      portfolioRepositoryMock,
      orderSellSnapshotRepositoryMock,
      quoteProviderMock,
      transactionManagerMock,
      new PortfolioDomainService()
    );
  });

  it("Deve atualizar ordem quando dados validos", async () => {
    const ordemExistente = new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra");
    const ordemAtualizada = new OrderEntity("1", "VALE3", 55.0, 200, "2024-01-01", "ACAO", "Compra");
    orderRepositoryMock.findByIdAsync.mockResolvedValue(ordemExistente);
    orderRepositoryMock.createAsync.mockResolvedValue(ordemAtualizada);
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

    const resultado = await service.executeAsync("1", {
      codigo: "VALE3",
      quantidade: 200,
      valor: 55.0,
      data: "2024-01-01",
      tipo: tipoValido,
      operacao: operacaoCompra,
    });

    expect(resultado).toBeDefined();
    expect(orderRepositoryMock.deleteAsync).toHaveBeenCalled();
    expect(orderRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve lancar erro quando ordem nao existe", async () => {
    orderRepositoryMock.findByIdAsync.mockResolvedValue(null);

    await expect(
      service.executeAsync("999", {
        codigo: "VALE3",
        quantidade: 100,
        valor: 50.0,
        data: "2024-01-01",
        tipo: tipoValido,
        operacao: operacaoCompra,
      })
    ).rejects.toThrow(NotFoundException);
  });

  it("Deve lancar erro quando dados invalidos", async () => {
    orderRepositoryMock.findByIdAsync.mockResolvedValue(new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"));

    await expect(
      service.executeAsync("1", {
        codigo: "",
        quantidade: 0,
        valor: 0,
        data: "",
        tipo: "" as orderTipo,
        operacao: "" as orderOperacao,
      })
    ).rejects.toThrow();
  });

  it("Deve lancar erro quando data futura", async () => {
    orderRepositoryMock.findByIdAsync.mockResolvedValue(new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"));
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);

    await expect(
      service.executeAsync("1", {
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