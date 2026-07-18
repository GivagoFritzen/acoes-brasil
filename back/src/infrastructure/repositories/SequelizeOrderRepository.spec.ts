import { SequelizeOrderRepository } from "./SequelizeOrderRepository";
import { Order as OrderModel } from "../../models/order/Order";
import type { OrderTipo as orderTipo, OrderOperacao as orderOperacao } from "../../../../common/models/order";

describe("SequelizeOrderRepository", () => {
  let repository: SequelizeOrderRepository;
  let modelMock: Record<string, string | number | Date>;

  beforeEach(() => {
    repository = new SequelizeOrderRepository();
    modelMock = {
      id: "1",
      codigo: "VALE3",
      valor: 1000.0,
      quantidade: 100,
      data: "2024-01-15",
      tipo: "ACAO",
      operacao: "Compra",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("createAsync", () => {
    it("Deve criar order e retornar entity", async () => {
      const createMock = jest.spyOn(OrderModel, "create").mockResolvedValue(modelMock);

      const orderData = {
        codigo: "VALE3",
        valor: 1000.0,
        quantidade: 100,
        data: "2024-01-15",
        tipo: "ACAO" as orderTipo,
        operacao: "Compra" as orderOperacao,
      };

      const resultado = await repository.createAsync(orderData);

      expect(createMock).toHaveBeenCalled();
      expect(resultado.id).toBe("1");
      expect(resultado.codigo).toBe("VALE3");
    });

    it("Deve passar transacao para create", async () => {
      const txMock = {};
      jest.spyOn(OrderModel, "create").mockResolvedValue(modelMock);

      await repository.createAsync({
        codigo: "VALE3",
        valor: 1000.0,
        quantidade: 100,
        data: "2024-01-15",
        tipo: "ACAO",
        operacao: "Compra",
      }, txMock);

      expect(OrderModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: "VALE3",
          quantidade: 100,
        }),
        { transaction: txMock }
      );
    });
  });

  describe("findByIdAsync", () => {
    it("Deve retornar entity quando encontrado", async () => {
      jest.spyOn(OrderModel, "findByPk").mockResolvedValue(modelMock);

      const resultado = await repository.findByIdAsync("1");

      expect(OrderModel.findByPk).toHaveBeenCalledWith("1", { transaction: undefined });
      expect(resultado).not.toBeNull();
      expect(resultado!.id).toBe("1");
    });

    it("Deve retornar null quando nao encontrado", async () => {
      jest.spyOn(OrderModel, "findByPk").mockResolvedValue(null);

      const resultado = await repository.findByIdAsync("999");

      expect(resultado).toBeNull();
    });
  });

  describe("findAllByCodigoAsync", () => {
    it("Deve retornar orders por codigo", async () => {
      const mockModels = [modelMock];
      jest.spyOn(OrderModel, "findAll").mockResolvedValue(mockModels);

      const resultado = await repository.findAllByCodigoAsync("VALE3");

      expect(resultado).toHaveLength(1);
      expect(OrderModel.findAll).toHaveBeenCalledWith({
        where: { codigo: "VALE3" },
        order: expect.any(Array),
        transaction: undefined,
      });
    });
  });

  describe("findAllPaginatedAsync", () => {
    it("Deve retornar orders paginados", async () => {
      jest.spyOn(OrderModel, "findAndCountAll").mockResolvedValue({
        rows: [modelMock],
        count: 1,
      } as object);

      const resultado = await repository.findAllPaginatedAsync({}, 1, 10);

      expect(resultado.data).toHaveLength(1);
      expect(resultado.page).toBe(1);
      expect(resultado.limit).toBe(10);
      expect(resultado.total).toBe(1);
    });

    it("Deve calcular totalPages corretamente", async () => {
      jest.spyOn(OrderModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 25,
      } as object);

      const resultado = await repository.findAllPaginatedAsync({}, 1, 10);

      expect(resultado.totalPages).toBe(3);
    });

    it("Deve calcular offset corretamente", async () => {
      jest.spyOn(OrderModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 0,
      } as object);

      await repository.findAllPaginatedAsync({}, 3, 10);

      expect(OrderModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 20, limit: 10 })
      );
    });
  });

  describe("deleteAsync", () => {
    it("Deve deletar order", async () => {
      jest.spyOn(OrderModel, "destroy").mockResolvedValue(1);

      await repository.deleteAsync("1");

      expect(OrderModel.destroy).toHaveBeenCalledWith({ where: { id: "1" }, transaction: undefined });
    });
  });

});