import { Op } from "sequelize";
import { SequelizeOrderSellSnapshotRepository } from "./SequelizeOrderSellSnapshotRepository";
import { OrderSellSnapshot as OrderSellSnapshotModel } from "../../models/order/OrderSellSnapshot";

describe("SequelizeOrderSellSnapshotRepository", () => {
  let repository: SequelizeOrderSellSnapshotRepository;
  let modelMock: Record<string, string | number | Date | boolean>;

  beforeEach(() => {
    repository = new SequelizeOrderSellSnapshotRepository();
    modelMock = {
      id: "1",
      orderId: "order-123",
      codigo: "VALE3",
      precoMedioAtual: 10.5,
      quantidade: 100,
      valorAtualAcao: 12.0,
      ganhos: 150.0,
      teveLucro: true,
      data: "2024-01-15",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("createAsync", () => {
    it("Deve criar snapshot e retornar entity", async () => {
      const createMock = jest.spyOn(OrderSellSnapshotModel, "create").mockResolvedValue(modelMock);

      const snapshotData = {
        orderId: "order-123",
        codigo: "VALE3",
        precoMedioAtual: 10.5,
        quantidade: 100,
        valorAtualAcao: 12.0,
        ganhos: 150.0,
        teveLucro: true,
        data: "2024-01-15",
      };

      const resultado = await repository.createAsync(snapshotData);

      expect(createMock).toHaveBeenCalled();
      expect(resultado.id).toBe("1");
      expect(resultado.codigo).toBe("VALE3");
    });

    it("Deve passar transacao para create", async () => {
      const txMock = {};
      jest.spyOn(OrderSellSnapshotModel, "create").mockResolvedValue(modelMock);

      await repository.createAsync({
        orderId: "order-123",
        codigo: "VALE3",
        precoMedioAtual: 10.5,
        quantidade: 100,
        valorAtualAcao: 12.0,
        ganhos: 150.0,
        teveLucro: true,
        data: "2024-01-15",
      }, txMock);

      expect(OrderSellSnapshotModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: "VALE3",
          quantidade: 100,
        }),
        { transaction: txMock }
      );
    });
  });

  describe("findAllAsync", () => {
    it("Deve retornar todos os snapshots ordenados", async () => {
      const mockModels = [modelMock];
      jest.spyOn(OrderSellSnapshotModel, "findAll").mockResolvedValue(mockModels);

      const resultado = await repository.findAllAsync();

      expect(resultado).toHaveLength(1);
      expect(OrderSellSnapshotModel.findAll).toHaveBeenCalledWith({
        where: {},
        order: expect.any(Array),
        transaction: undefined,
      });
    });

    it("Deve filtrar snapshots por ano quando ano informado", async () => {
      const mockModels = [modelMock];
      const findAllSpy = jest.spyOn(OrderSellSnapshotModel, "findAll").mockResolvedValue(mockModels);

      const resultado = await repository.findAllAsync("2024");

      expect(resultado).toHaveLength(1);
      expect(findAllSpy).toHaveBeenCalledWith({
        where: { data: { [Op.endsWith]: "-2024" } },
        order: expect.any(Array),
        transaction: undefined,
      });
    });

    it("Deve retornar array vazio quando tabela nao existe", async () => {
      jest.spyOn(OrderSellSnapshotModel, "findAll").mockRejectedValue(
        new Error("Invalid object name 'ordersellsnapshots'")
      );

      const resultado = await repository.findAllAsync();

      expect(resultado).toEqual([]);
    });

    it("Deve propagar erro quando e outro tipo de erro", async () => {
      jest.spyOn(OrderSellSnapshotModel, "findAll").mockRejectedValue(
        new Error("Some other error")
      );

      await expect(repository.findAllAsync()).rejects.toThrow("Some other error");
    });

    it("Deve retornar array vazio para erro 'no such table'", async () => {
      jest.spyOn(OrderSellSnapshotModel, "findAll").mockRejectedValue(
        new Error("no such table: ordersellsnapshots")
      );

      const resultado = await repository.findAllAsync();

      expect(resultado).toEqual([]);
    });

    it("Deve retornar array vazio para erro 'does not exist'", async () => {
      jest.spyOn(OrderSellSnapshotModel, "findAll").mockRejectedValue(
        new Error("Table 'ordersellsnapshots' does not exist")
      );

      const resultado = await repository.findAllAsync();

      expect(resultado).toEqual([]);
    });
  });
});