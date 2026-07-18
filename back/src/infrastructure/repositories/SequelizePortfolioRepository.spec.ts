import { SequelizePortfolioRepository } from "./SequelizePortfolioRepository";
import { Portfolio as PortfolioModel } from "../../models/portfolio/Portfolio";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("SequelizePortfolioRepository", () => {
  let repository: SequelizePortfolioRepository;
  let modelMock: Record<string, string | number | Date>;

  beforeEach(() => {
    repository = new SequelizePortfolioRepository();
    modelMock = {
      id: "1",
      codigo: "VALE3",
      quantidade: 100,
      precoMedio: 10.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("createAsync", () => {
    it("Deve criar portfolio e retornar entity", async () => {
      const createMock = jest.spyOn(PortfolioModel, "create").mockResolvedValue(modelMock);

      const portfolioData = {
        codigo: "VALE3",
        quantidade: 100,
        precoMedio: 10.5,
      };

      const resultado = await repository.createAsync(portfolioData);

      expect(createMock).toHaveBeenCalled();
      expect(resultado.id).toBe("1");
      expect(resultado.codigo).toBe("VALE3");
    });

    it("Deve passar transacao para create", async () => {
      const txMock = {};
      const createMock = jest.spyOn(PortfolioModel, "create").mockResolvedValue(modelMock);

      await repository.createAsync({
        codigo: "VALE3",
        quantidade: 100,
        precoMedio: 10.5,
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
      const findByPkMock = jest.spyOn(PortfolioModel, "findByPk").mockResolvedValue(modelMock);

      const resultado = await repository.findByIdAsync("1");

      expect(findByPkMock).toHaveBeenCalledWith("1", { transaction: undefined });
      expect(resultado).not.toBeNull();
      expect(resultado!.id).toBe("1");
    });

    it("Deve retornar null quando nao encontrado", async () => {
      jest.spyOn(PortfolioModel, "findByPk").mockResolvedValue(null);

      const resultado = await repository.findByIdAsync("999");

      expect(resultado).toBeNull();
    });
  });

  describe("findByCodigoAsync", () => {
    it("Deve retornar entity quando encontrado por codigo", async () => {
      const findOneMock = jest.spyOn(PortfolioModel, "findOne").mockResolvedValue(modelMock);

      const resultado = await repository.findByCodigoAsync("VALE3");

      expect(findOneMock).toHaveBeenCalledWith({ where: { codigo: "VALE3" }, transaction: undefined });
      expect(resultado).not.toBeNull();
      expect(resultado!.codigo).toBe("VALE3");
    });

    it("Deve retornar null quando nao encontrado", async () => {
      jest.spyOn(PortfolioModel, "findOne").mockResolvedValue(null);

      const resultado = await repository.findByCodigoAsync("INEXISTENTE");

      expect(resultado).toBeNull();
    });
  });

  describe("findAllAsync", () => {
    it("Deve retornar todos os portfolios", async () => {
      const mockModels = [modelMock];
      jest.spyOn(PortfolioModel, "findAll").mockResolvedValue(mockModels);

      const resultado = await repository.findAllAsync();

      expect(resultado).toHaveLength(1);
      expect(PortfolioModel.findAll).toHaveBeenCalledWith({
        order: [["createdAt", "DESC"]],
        transaction: undefined,
      });
    });
  });

  describe("saveAsync", () => {
    it("Deve salvar alteracoes e retornar entity", async () => {
      const saveMock = jest.fn().mockResolvedValue(modelMock);
      const findByPkMock = jest.spyOn(PortfolioModel, "findByPk").mockResolvedValue({
        ...modelMock,
        quantidade: 150,
        save: saveMock,
      });

      const portfolio = new PortfolioEntity("1", "VALE3", 150, 10.5);

      const resultado = await repository.saveAsync(portfolio);

      expect(findByPkMock).toHaveBeenCalledWith("1", { transaction: undefined });
      expect(saveMock).toHaveBeenCalled();
      expect(resultado.id).toBe("1");
    });

    it("Deve lancar erro quando portfolio nao encontrado", async () => {
      jest.spyOn(PortfolioModel, "findByPk").mockResolvedValue(null);

      const portfolio = new PortfolioEntity("999", "VALE3", 100, 10.5);

      await expect(repository.saveAsync(portfolio)).rejects.toThrow("portfolio with ID 999 not found to save.");
    });
  });

  describe("deleteByCodigoAsync", () => {
    it("Deve deletar portfolio por codigo", async () => {
      const destroyMock = jest.spyOn(PortfolioModel, "destroy").mockResolvedValue(1);

      await repository.deleteByCodigoAsync("VALE3");

      expect(destroyMock).toHaveBeenCalledWith({ where: { codigo: "VALE3" }, transaction: undefined });
    });

    it("Deve passar transacao para destroy", async () => {
      const txMock = {};
      jest.spyOn(PortfolioModel, "destroy").mockResolvedValue(1);

      await repository.deleteByCodigoAsync("VALE3", txMock);

      expect(PortfolioModel.destroy).toHaveBeenCalledWith({ where: { codigo: "VALE3" }, transaction: txMock });
    });
  });
});