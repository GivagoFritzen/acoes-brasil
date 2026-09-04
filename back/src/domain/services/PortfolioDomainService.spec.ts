import { PortfolioDomainService } from "./PortfolioDomainService";
import { IOrderRepository } from "../interfaces/IOrderRepository";
import { IPortfolioRepository } from "../interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../interfaces/IOrderSellSnapshotRepository";
import { PortfolioEntity } from "../entities/PortfolioEntity";
import { OrderEntity } from "../entities/OrderEntity";
import { BusinessException } from "../../shared/exceptions/BusinessException";

describe("PortfolioDomainService", () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let orderSellSnapshotRepositoryMock: jest.Mocked<IOrderSellSnapshotRepository>;
  let service: PortfolioDomainService;

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
      findAllAsync: jest.fn(),
    } as jest.Mocked<IOrderSellSnapshotRepository>;

    service = new PortfolioDomainService();
  });

  describe("resolveCodigoForPortfolioAsync", () => {
    it("Deve retornar codigo do portfolio quando encontrado", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      const resultado = await service.resolveCodigoForPortfolioAsync("VALE3", undefined, portfolioRepositoryMock);

      expect(resultado).toBe("VALE3");
      expect(portfolioRepositoryMock.findByCodigoAsync).toHaveBeenCalledWith("VALE3", undefined);
    });

    it("Deve retornar codigo normalizado quando portfolio nao encontrado", async () => {
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      const resultado = await service.resolveCodigoForPortfolioAsync("vale3", undefined, portfolioRepositoryMock);

      expect(resultado).toBe("VALE3");
    });

    it("Deve normalizar codigo com espacos e caracteres especiais", async () => {
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      const resultado = await service.resolveCodigoForPortfolioAsync(" VALE 3 ", undefined, portfolioRepositoryMock);

      expect(resultado).toBe("VALE3");
    });
  });

  describe("rebuildPortfolioByCodigoAsync", () => {
    it("Deve criar portfolio quando ordens existem e portfolio nao existe", async () => {
      const ordens = [
        new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"),
      ];
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);
      portfolioRepositoryMock.createAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 100, 50.0));

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolioRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: "VALE3", quantidade: 100, precoMedio: 50.0 }),
        undefined
      );
    });

    it("Deve atualizar portfolio quando ja existe", async () => {
      const ordens = [
        new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"),
      ];
      const portfolio = new PortfolioEntity("1", "VALE3", 50, 40.0);
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolio.quantidade).toBe(100);
      expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalled();
    });

    it("Deve calcular preco medio corretamente com multiplas compras", async () => {
      const ordens = [
        new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"),
        new OrderEntity("2", "VALE3", 60.0, 100, "2024-01-02", "ACAO", "Compra"),
      ];
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);
      portfolioRepositoryMock.createAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 0, 0));

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolioRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({ quantidade: 200, precoMedio: 55.0 }),
        undefined
      );
    });

    it("Deve remover portfolio quando quantidade resulta em zero e portfolio existe", async () => {
      const ordens = [
        new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"),
        new OrderEntity("2", "VALE3", 55.0, 100, "2024-01-02", "ACAO", "Venda"),
      ];
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolioRepositoryMock.deleteByCodigoAsync).toHaveBeenCalledWith("VALE3", undefined);
    });

    it("Deve nao deletar portfolio quando quantidade resulta em zero e portfolio nao existe", async () => {
      const ordens = [
        new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"),
        new OrderEntity("2", "VALE3", 55.0, 100, "2024-01-02", "ACAO", "Venda"),
      ];
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolioRepositoryMock.deleteByCodigoAsync).not.toHaveBeenCalled();
    });

    it("Deve deletar portfolio quando venda deixaria quantidade negativa", async () => {
      const ordens = [
        new OrderEntity("2", "VALE3", 55.0, 100, "2024-01-02", "ACAO", "Venda"),
      ];
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolioRepositoryMock.deleteByCodigoAsync).toHaveBeenCalledWith("VALE3", undefined);
    });

    it("Deve deletar portfolio existente quando quantidade resulta em zero", async () => {
      const ordens = [
        new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra"),
        new OrderEntity("2", "VALE3", 55.0, 100, "2024-01-02", "ACAO", "Venda"),
      ];
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);
      const portfolio = new PortfolioEntity("1", "VALE3", 0, 0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolioRepositoryMock.deleteByCodigoAsync).toHaveBeenCalledWith("VALE3", undefined);
    });

    it("Deve retornar quando nao ha ordens", async () => {
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue([]);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      await service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(portfolioRepositoryMock.createAsync).not.toHaveBeenCalled();
      expect(portfolioRepositoryMock.saveAsync).not.toHaveBeenCalled();
    });
  });

  describe("updatePortfolioByOrderAsync", () => {
    const inputBase = {
      orderId: "order-1",
      codigo: "VALE3",
      quantidade: 100,
      valor: 50.0,
      operacao: "Compra" as const,
      data: "2024-01-01",
    };

    it("Deve criar portfolio quando compra e portfolio nao existe", async () => {
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);
      portfolioRepositoryMock.createAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 100, 50.0));

      await service.updatePortfolioByOrderAsync(inputBase, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(portfolioRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: "VALE3", quantidade: 100, precoMedio: 50.0 }),
        undefined
      );
    });

    it("Deve retornar warning sem criar portfolio quando venda e portfolio nao existe", async () => {
      const inputVenda = { ...inputBase, operacao: "Venda" as const };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      const resultado = await service.updatePortfolioByOrderAsync(inputVenda, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(resultado.warning).toContain("VALE3");
      expect(portfolioRepositoryMock.createAsync).not.toHaveBeenCalled();
    });

    it("Deve atualizar portfolio quando compra e portfolio existe", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 40.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.updatePortfolioByOrderAsync(inputBase, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(portfolio.quantidade).toBe(200);
      expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalled();
    });

    it("Deve atualizar portfolio quando venda e portfolio existe", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 200, 50.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);
      orderSellSnapshotRepositoryMock.createAsync.mockResolvedValue({} as any);

      await service.updatePortfolioByOrderAsync(inputVenda, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(portfolio.quantidade).toBe(100);
      expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalled();
    });

    it("Deve criar snapshot de venda com lucro quando valor venda > preco medio", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 40.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const, quantidade: 50, valor: 60.0 };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);
      orderSellSnapshotRepositoryMock.createAsync.mockResolvedValue({} as any);

      await service.updatePortfolioByOrderAsync(inputVenda, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(orderSellSnapshotRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          teveLucro: true,
          ganhos: 1000,
        }),
        undefined
      );
    });

    it("Deve criar snapshot de venda com prejuizo quando valor venda < preco medio", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const, quantidade: 50, valor: 30.0 };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);
      orderSellSnapshotRepositoryMock.createAsync.mockResolvedValue({} as any);

      await service.updatePortfolioByOrderAsync(inputVenda, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(orderSellSnapshotRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          teveLucro: false,
          ganhos: -1000,
        }),
        undefined
      );
    });

    it("Deve usar quote como valorReferencia quando informado", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const, quantidade: 50, valor: 40.0 };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);
      orderSellSnapshotRepositoryMock.createAsync.mockResolvedValue({} as any);

      await service.updatePortfolioByOrderAsync(inputVenda, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock, 55.0);

      expect(orderSellSnapshotRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          valorAtualAcao: 55.0,
          ganhos: 250,
        }),
        undefined
      );
    });

    it("Deve lancar erro quando calculo de ganhos resulta em valor nao finito", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const, quantidade: 50, valor: NaN };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await expect(
        service.updatePortfolioByOrderAsync(inputVenda, "pt-BR", undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock)
      ).rejects.toThrow(BusinessException);
    });
  });

  describe("validateSellAsync", () => {
    it("Deve retornar divergencia quando portfolio nao existe", async () => {
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      const resultado = await service.validateSellAsync("VALE3", 100, "pt-BR", undefined, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(true);
      expect(resultado.divergence).toBeDefined();
      expect(resultado.divergence?.codigo).toBe("VALE3");
      expect(resultado.divergence?.quantidadeDisponivel).toBe(0);
    });

    it("Deve retornar divergencia quando quantidade resultaria em zero", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 50, 50.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      const resultado = await service.validateSellAsync("VALE3", 50, "pt-BR", undefined, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(true);
      expect(resultado.divergence).toBeDefined();
      expect(resultado.divergence?.quantidadeDisponivel).toBe(50);
    });

    it("Deve retornar divergencia quando quantidade resultaria em negativo", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 50, 50.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      const resultado = await service.validateSellAsync("VALE3", 100, "pt-BR", undefined, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(true);
      expect(resultado.divergence).toBeDefined();
      expect(resultado.divergence?.quantidadeDisponivel).toBe(50);
    });

    it("Deve retornar sem divergencia quando quantidade e suficiente", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      const resultado = await service.validateSellAsync("VALE3", 50, "pt-BR", undefined, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(false);
      expect(resultado.divergence).toBeUndefined();
    });

    it("Deve retornar sem divergencia quando quantidade resulta em exatamente 1", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 50.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      const resultado = await service.validateSellAsync("VALE3", 99, "pt-BR", undefined, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(false);
      expect(resultado.divergence).toBeUndefined();
    });
  });

  describe("updatePortfolioByOrderAsync - skipSave", () => {
    const inputBase = {
      orderId: "order-1",
      codigo: "VALE3",
      quantidade: 100,
      valor: 50.0,
      operacao: "Compra" as const,
      data: "2024-01-01",
    };

    it("Deve retornar warning sem salvar quando skipSave=true e venda sem portfolio", async () => {
      const inputVenda = { ...inputBase, operacao: "Venda" as const };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      const resultado = await service.updatePortfolioByOrderAsync(
        inputVenda,
        "pt-BR",
        undefined,
        portfolioRepositoryMock,
        orderSellSnapshotRepositoryMock,
        null,
        true
      );

      expect(resultado.warning).toContain("VALE3");
      expect(portfolioRepositoryMock.createAsync).not.toHaveBeenCalled();
    });

    it("Deve nao salvar quando skipSave=true e compra com portfolio existente", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 40.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.updatePortfolioByOrderAsync(
        inputBase,
        "pt-BR",
        undefined,
        portfolioRepositoryMock,
        orderSellSnapshotRepositoryMock,
        null,
        true
      );

      expect(portfolio.quantidade).toBe(100);
      expect(portfolioRepositoryMock.saveAsync).not.toHaveBeenCalled();
    });

    it("Deve nao salvar quando skipSave=true e venda com portfolio existente", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 200, 50.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.updatePortfolioByOrderAsync(
        inputVenda,
        "pt-BR",
        undefined,
        portfolioRepositoryMock,
        orderSellSnapshotRepositoryMock,
        null,
        true
      );

      expect(portfolio.quantidade).toBe(200);
      expect(portfolioRepositoryMock.saveAsync).not.toHaveBeenCalled();
      expect(orderSellSnapshotRepositoryMock.createAsync).not.toHaveBeenCalled();
    });
  });

  describe("validateDeleteOrderAsync", () => {
    it("Deve retornar sem divergencia quando remocao nao causa problema", async () => {
      const ordem = new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra");
      orderRepositoryMock.findByIdAsync.mockResolvedValue(ordem);
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue([ordem]);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 100, 50));

      const resultado = await service.validateDeleteOrderAsync("1", "pt-BR", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(false);
      expect(resultado.divergences).toHaveLength(0);
    });

    it("Deve retornar divergencia quando remocao deixaria quantidade negativa", async () => {
      const compra = new OrderEntity("1", "VALE3", 50.0, 100, "2024-01-01", "ACAO", "Compra");
      const venda = new OrderEntity("2", "VALE3", 60.0, 150, "2024-01-02", "ACAO", "Venda");
      orderRepositoryMock.findByIdAsync.mockResolvedValue(compra);
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue([compra, venda]);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      const resultado = await service.validateDeleteOrderAsync("1", "pt-BR", undefined, orderRepositoryMock, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(true);
      expect(resultado.divergences).toHaveLength(1);
      expect(resultado.divergences[0].mensagem).toContain("quantidade");
    });

    it("Deve retornar sem divergencia quando ordem nao existe", async () => {
      orderRepositoryMock.findByIdAsync.mockResolvedValue(null);

      const resultado = await service.validateDeleteOrderAsync("999", "pt-BR", orderRepositoryMock, portfolioRepositoryMock);

      expect(resultado.hasDivergence).toBe(false);
      expect(resultado.divergences).toHaveLength(0);
    });
  });
});
