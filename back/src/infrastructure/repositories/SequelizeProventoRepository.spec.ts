import { SequelizeProventoRepository } from "./SequelizeProventoRepository";
import { Provento as ProventoModel } from "../../models/provento/Provento";
import { ProventoTipo as proventoTipo } from "../../../../common/models/provento/ProventoTipoModel";

describe("SequelizeProventoRepository", () => {
  let repository: SequelizeProventoRepository;
  let modelMock: Record<string, string | number | Date>;

  beforeEach(() => {
    repository = new SequelizeProventoRepository();
    modelMock = {
      id: "1",
      codigo: "VALE3",
      data: "2024-01-15",
      tipo: "Dividendo" as proventoTipo,
      instituicao: "Banco do Brasil",
      quantidade: 100,
      precoUnitario: 1.0,
      valorLiquido: 100.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("createAsync", () => {
    it("Deve criar provento e retornar entity", async () => {
      const createMock = jest.spyOn(ProventoModel, "create").mockResolvedValue(modelMock);

      const proventoData = {
        codigo: "VALE3",
        data: "2024-01-15",
        tipo: "Dividendo" as proventoTipo,
        instituicao: "Banco do Brasil",
        quantidade: 100,
        precoUnitario: 1.0,
        valorLiquido: 100.0,
      };

      const resultado = await repository.createAsync(proventoData);

      expect(createMock).toHaveBeenCalled();
      expect(resultado.id).toBe("1");
      expect(resultado.codigo).toBe("VALE3");
    });

    it("Deve passar transacao para create", async () => {
      const txMock = {};
      const createMock = jest.spyOn(ProventoModel, "create").mockResolvedValue(modelMock);

      await repository.createAsync({
        codigo: "VALE3",
        data: "2024-01-15",
        tipo: "Dividendo",
        instituicao: "Banco do Brasil",
        quantidade: 100,
        precoUnitario: 1.0,
        valorLiquido: 100.0,
      }, txMock);

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: "VALE3",
          quantidade: 100,
        }),
        { transaction: txMock }
      );
    });
  });

  describe("createManyAsync", () => {
    it("Deve criar multiplos proventos e retornar entities", async () => {
      const createSpy = jest.spyOn(repository, "createAsync").mockResolvedValue(modelMock);
      const proventos = [
        { codigo: "VALE3", data: "2024-01-15", tipo: "Dividendo" as proventoTipo, instituicao: "BB", quantidade: 100, precoUnitario: 1.0, valorLiquido: 100.0 },
        { codigo: "PETR4", data: "2024-01-20", tipo: "Dividendo" as proventoTipo, instituicao: "BB", quantidade: 50, precoUnitario: 2.0, valorLiquido: 100.0 },
      ];

      const resultado = await repository.createManyAsync(proventos);

      expect(createSpy).toHaveBeenCalledTimes(2);
      expect(resultado).toHaveLength(2);
    });

    it("Deve passar transacao para cada createAsync", async () => {
      const txMock = {};
      const createMock = jest.spyOn(ProventoModel, "create").mockResolvedValue(modelMock);
      const proventos = [
        { codigo: "VALE3", data: "2024-01-15", tipo: "Dividendo" as proventoTipo, instituicao: "BB", quantidade: 100, precoUnitario: 1.0, valorLiquido: 100.0 },
      ];

      await repository.createManyAsync(proventos, txMock);

      expect(createMock).toHaveBeenCalledWith(
        expect.any(Object),
        { transaction: txMock }
      );
    });
  });

  describe("findByIdAsync", () => {
    it("Deve retornar entity quando encontrado", async () => {
      const findByPkMock = jest.spyOn(ProventoModel, "findByPk").mockResolvedValue(modelMock);

      const resultado = await repository.findByIdAsync("1");

      expect(findByPkMock).toHaveBeenCalledWith("1", { transaction: undefined });
      expect(resultado).not.toBeNull();
      expect(resultado!.id).toBe("1");
    });

    it("Deve retornar null quando nao encontrado", async () => {
      jest.spyOn(ProventoModel, "findByPk").mockResolvedValue(null);

      const resultado = await repository.findByIdAsync("999");

      expect(resultado).toBeNull();
    });

    it("Deve passar transacao para findByPk", async () => {
      const txMock = {};
      jest.spyOn(ProventoModel, "findByPk").mockResolvedValue(modelMock);

      await repository.findByIdAsync("1", txMock);

      expect(ProventoModel.findByPk).toHaveBeenCalledWith("1", { transaction: txMock });
    });
  });

  describe("deleteAsync", () => {
    it("Deve deletar provento", async () => {
      const destroyMock = jest.spyOn(ProventoModel, "destroy").mockResolvedValue(1);

      await repository.deleteAsync("1");

      expect(destroyMock).toHaveBeenCalledWith({ where: { id: "1" }, transaction: undefined });
    });

    it("Deve passar transacao para destroy", async () => {
      const txMock = {};
      jest.spyOn(ProventoModel, "destroy").mockResolvedValue(1);

      await repository.deleteAsync("1", txMock);

      expect(ProventoModel.destroy).toHaveBeenCalledWith({ where: { id: "1" }, transaction: txMock });
    });
  });

  describe("findAllAsync", () => {
    it("Deve retornar proventos com paginacao padrao", async () => {
      const mockModels = [modelMock];
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: mockModels,
        count: 1,
      } as object);

      const resultado = await repository.findAllAsync({});

      expect(resultado.rows).toHaveLength(1);
      expect(resultado.count).toBe(1);
    });

    it("Deve normalizar pagina minima para 1", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 0,
      } as object);

      await repository.findAllAsync({ page: 0 });

      expect(ProventoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, limit: 20 })
      );
    });

    it("Deve normalizar limite minimo para 1 quando 0", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 0,
      } as object);

      await repository.findAllAsync({ page: 1, limit: 0 });

      expect(ProventoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      );
    });

    it("Deve calcular offset corretamente", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 0,
      } as object);

      await repository.findAllAsync({ page: 3, limit: 10 });

      expect(ProventoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 20, limit: 10 })
      );
    });

    it("Deve filtrar por codigo", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [modelMock],
        count: 1,
      } as object);

      const resultado = await repository.findAllAsync({ codigo: "VALE3" });

      expect(resultado.rows).toHaveLength(1);
      expect(ProventoModel.findAndCountAll).toHaveBeenCalled();
    });

    it("Deve filtrar por tipo", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [modelMock],
        count: 1,
      } as object);

      await repository.findAllAsync({ tipo: "Dividendo" });

      expect(ProventoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tipo: "Dividendo" }),
        })
      );
    });

    it("Deve retornar proventos agrupados por codigo quando agruparPorCodigo true", async () => {
      const modelMock2 = { ...modelMock, id: "2", quantidade: 50, valorLiquido: 50.0, precoUnitario: 1.0 };
      jest.spyOn(ProventoModel, "findAll").mockResolvedValue([modelMock, modelMock2]);

      const resultado = await repository.findAllAsync({ agruparPorCodigo: true });

      expect(resultado.rows).toHaveLength(1);
      expect(resultado.rows[0].quantidade).toBe(150);
      expect(resultado.rows[0].valorLiquido).toBe(150.0);
    });

    it("Deve agrupar por codigo e tipo separadamente", async () => {
      const modelMock2 = { ...modelMock, id: "2", codigo: "PETR4", quantidade: 50, valorLiquido: 50.0, precoUnitario: 1.0 };
      jest.spyOn(ProventoModel, "findAll").mockResolvedValue([modelMock, modelMock2]);

      const resultado = await repository.findAllAsync({ agruparPorCodigo: true });

      expect(resultado.rows).toHaveLength(2);
    });

    it("Deve calcular precoUnitario medio no agrupamento", async () => {
      const modelMock2 = { ...modelMock, id: "2", quantidade: 100, valorLiquido: 300.0, precoUnitario: 3.0 };
      jest.spyOn(ProventoModel, "findAll").mockResolvedValue([modelMock, modelMock2]);

      const resultado = await repository.findAllAsync({ agruparPorCodigo: true });

      expect(resultado.rows[0].precoUnitario).toBe(2.0);
    });
  });
});
