import { ImportOrdersService } from "./ImportOrdersService";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { CreateOrderDto } from "../dto/CreateOrderDto";
import { OrderEntity } from "../../domain/entities/OrderEntity";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";

describe("ImportOrdersService", () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let orderSellSnapshotRepositoryMock: jest.Mocked<IOrderSellSnapshotRepository>;
  let quoteProviderMock: jest.Mocked<IQuoteProvider>;
  let transactionManagerMock: jest.Mocked<ITransactionManager>;
  let service: ImportOrdersService;

  beforeEach(() => {
    orderRepositoryMock = {
      createAsync: jest.fn().mockResolvedValue(new OrderEntity("1", "VALE3", 0, 0, "", "ACAO", "Compra")),
      findByIdAsync: jest.fn(),
      findAllByCodigoAsync: jest.fn().mockResolvedValue([]),
      findAllPaginatedAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as jest.Mocked<IOrderRepository>;

    portfolioRepositoryMock = {
      createAsync: jest.fn().mockResolvedValue(new PortfolioEntity("1", "VALE3", 0, 0)),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn().mockResolvedValue(null),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn().mockResolvedValue(new PortfolioEntity("1", "VALE3", 0, 0)),
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

    const resultado = await service.executeAsync(orders, "pt-BR", true);

    expect(resultado.imported).toBe(1);
    expect(resultado.warnings).toHaveLength(0);
    expect(orderRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve lancarr erro quando array vazio", async () => {
    await expect(service.executeAsync([], "pt-BR")).rejects.toThrow("Planilha sem dados.");
  });

  it("Deve lancarr erro quando dado obrigatorio faltando", async () => {
    const orders: CreateOrderDto[] = [
      { codigo: "", quantidade: 100, valor: 50.0, data: "01-01-2024", tipo: "ACAO", operacao: "Compra" },
    ];

    await expect(service.executeAsync(orders, "pt-BR")).rejects.toThrow();
  });

  it("Deve retornar warning sem criar portfolio quando vender ativo que nao existe no portfolio", async () => {
    orderRepositoryMock.createAsync.mockImplementation(async (data) => {
      return new OrderEntity("1", data.codigo, data.valor, data.quantidade, data.data, data.tipo, data.operacao);
    });

    const orders: CreateOrderDto[] = [
      { codigo: "BBDC1", quantidade: 1, valor: 0.07, data: "13-08-2026", tipo: "FRACIONARIO", operacao: "Venda" },
    ];

    const resultado = await service.executeAsync(orders, "pt-BR", true);

    expect(resultado.imported).toBe(1);
    expect(resultado.warnings).toHaveLength(1);
    expect(resultado.warnings[0]).toContain("BBDC1");
    expect(portfolioRepositoryMock.createAsync).not.toHaveBeenCalled();
  });

  describe("validateAsync", () => {
    it("Deve retornar divergencias quando venda de ativo inexistente", async () => {
      orderRepositoryMock.createAsync.mockImplementation(async (data) => {
        return new OrderEntity("1", data.codigo, data.valor, data.quantidade, data.data, data.tipo, data.operacao);
      });

      const orders: CreateOrderDto[] = [
        { codigo: "BBDC1", quantidade: 1, valor: 0.07, data: "13-08-2026", tipo: "FRACIONARIO", operacao: "Venda" },
      ];

      const resultado = await service.validateAsync(orders, "pt-BR");

      expect(resultado.hasDivergences).toBe(true);
      expect(resultado.divergences).toHaveLength(1);
      expect(resultado.divergences[0].codigo).toBe("BBDC1");
      expect(resultado.divergences[0].quantidadeDisponivel).toBe(0);
    });

    it("Deve retornar divergencias quando quantidade resultaria em menos de 1", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 50, 40.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      const orders: CreateOrderDto[] = [
        { codigo: "VALE3", quantidade: 100, valor: 50.0, data: "01-01-2024", tipo: "ACAO", operacao: "Venda" },
      ];

      const resultado = await service.validateAsync(orders, "pt-BR");

      expect(resultado.hasDivergences).toBe(true);
      expect(resultado.divergences).toHaveLength(1);
      expect(resultado.divergences[0].quantidadeDisponivel).toBe(50);
    });

    it("Deve retornar sem divergencias quando operaacao e valida", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 200, 40.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      const orders: CreateOrderDto[] = [
        { codigo: "VALE3", quantidade: 100, valor: 50.0, data: "01-01-2024", tipo: "ACAO", operacao: "Venda" },
      ];

      const resultado = await service.validateAsync(orders, "pt-BR");

      expect(resultado.hasDivergences).toBe(false);
      expect(resultado.divergences).toHaveLength(0);
    });

    it("Deve ignorar compras na validacao de divergencias", async () => {
      const orders: CreateOrderDto[] = [
        { codigo: "VALE3", quantidade: 100, valor: 50.0, data: "01-01-2024", tipo: "ACAO", operacao: "Compra" },
      ];

      const resultado = await service.validateAsync(orders, "pt-BR");

      expect(resultado.hasDivergences).toBe(false);
      expect(resultado.divergences).toHaveLength(0);
    });
  });

  describe("executeAsync com confirmado", () => {
    it("Deve lancar erro quando existem divergencias e confirmado=false", async () => {
      const orders: CreateOrderDto[] = [
        { codigo: "BBDC1", quantidade: 1, valor: 0.07, data: "13-08-2026", tipo: "FRACIONARIO", operacao: "Venda" },
      ];

      await expect(service.executeAsync(orders, "pt-BR", false)).rejects.toThrow();
    });

    it("Deve processar quando confirmado=true e existem divergencias", async () => {
      orderRepositoryMock.createAsync.mockImplementation(async (data) => {
        return new OrderEntity("1", data.codigo, data.valor, data.quantidade, data.data, data.tipo, data.operacao);
      });

      const orders: CreateOrderDto[] = [
        { codigo: "BBDC1", quantidade: 1, valor: 0.07, data: "13-08-2026", tipo: "FRACIONARIO", operacao: "Venda" },
      ];

      const resultado = await service.executeAsync(orders, "pt-BR", true);

      expect(resultado.imported).toBe(1);
      expect(resultado.warnings).toHaveLength(1);
    });

    it("Deve processar quando nao ha divergencias e confirmado=false", async () => {
      const orders: CreateOrderDto[] = [
        { codigo: "VALE3", quantidade: 100, valor: 50.0, data: "01-01-2024", tipo: "ACAO", operacao: "Compra" },
      ];

      const resultado = await service.executeAsync(orders, "pt-BR", false);

      expect(resultado.imported).toBe(1);
    });
  });
});
