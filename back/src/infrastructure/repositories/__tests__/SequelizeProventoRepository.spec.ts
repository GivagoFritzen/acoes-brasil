import { SequelizeProventoRepository } from "../../repositories/SequelizeProventoRepository";
import { Provento as ProventoModel } from "../../../models/provento/Provento";
import { ProventoEntity } from "../../../domain/entities/ProventoEntity";
import { ProventoTipo } from "../../../../common/models/provento/provento-tipo.model";

describe("SequelizeProventoRepository", () => {
  let repository: SequelizeProventoRepository;
  let modelMock: any;

  beforeEach(() => {
    repository = new SequelizeProventoRepository();
    modelMock = {
      id: "1",
      codigo: "VALE3",
      data: "2024-01-15",
      tipo: "Dividendo" as ProventoTipo,
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
        tipo: "Dividendo" as ProventoTipo,
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
      });

      const resultado = await repository.findAllAsync({});

      expect(resultado.rows).toHaveLength(1);
      expect(resultado.count).toBe(1);
    });

    it("Deve normalizar pagina minima para 1", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 0,
      });

      await repository.findAllAsync({ page: 0 });

      expect(ProventoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, limit: 20 })
      );
    });

    it("Deve normalizar limite minimo para 1 quando 0", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 0,
      });

      await repository.findAllAsync({ page: 1, limit: 0 });

      expect(ProventoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 1 })
      );
    });

    it("Deve calcular offset corretamente", async () => {
      jest.spyOn(ProventoModel, "findAndCountAll").mockResolvedValue({
        rows: [],
        count: 0,
      });

      await repository.findAllAsync({ page: 3, limit: 10 });

      expect(ProventoModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 20, limit: 10 })
      );
    });
  });
});