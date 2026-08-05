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

    it("Deve lancar erro quando venda deixaria portfolio inconsistente", async () => {
      const ordens = [
        new OrderEntity("2", "VALE3", 55.0, 100, "2024-01-02", "ACAO", "Venda"),
      ];
      orderRepositoryMock.findAllByCodigoAsync.mockResolvedValue(ordens);

      await expect(
        service.rebuildPortfolioByCodigoAsync("VALE3", undefined, orderRepositoryMock, portfolioRepositoryMock)
      ).rejects.toThrow(BusinessException);
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

      await service.updatePortfolioByOrderAsync(inputBase, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(portfolioRepositoryMock.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: "VALE3", quantidade: 100, precoMedio: 50.0 }),
        undefined
      );
    });

    it("Deve lancar erro quando venda e portfolio nao existe", async () => {
      const inputVenda = { ...inputBase, operacao: "Venda" as const };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

      await expect(
        service.updatePortfolioByOrderAsync(inputVenda, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock)
      ).rejects.toThrow(BusinessException);
    });

    it("Deve atualizar portfolio quando compra e portfolio existe", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 40.0);
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);

      await service.updatePortfolioByOrderAsync(inputBase, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(portfolio.quantidade).toBe(200);
      expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalled();
    });

    it("Deve atualizar portfolio quando venda e portfolio existe", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 200, 50.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);
      orderSellSnapshotRepositoryMock.createAsync.mockResolvedValue({} as any);

      await service.updatePortfolioByOrderAsync(inputVenda, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

      expect(portfolio.quantidade).toBe(100);
      expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalled();
    });

    it("Deve criar snapshot de venda com lucro quando valor venda > preco medio", async () => {
      const portfolio = new PortfolioEntity("1", "VALE3", 100, 40.0);
      const inputVenda = { ...inputBase, operacao: "Venda" as const, quantidade: 50, valor: 60.0 };
      portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolio);
      orderSellSnapshotRepositoryMock.createAsync.mockResolvedValue({} as any);

      await service.updatePortfolioByOrderAsync(inputVenda, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

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

      await service.updatePortfolioByOrderAsync(inputVenda, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock);

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

      await service.updatePortfolioByOrderAsync(inputVenda, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock, 55.0);

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
        service.updatePortfolioByOrderAsync(inputVenda, undefined, portfolioRepositoryMock, orderSellSnapshotRepositoryMock)
      ).rejects.toThrow(BusinessException);
    });
  });
});
