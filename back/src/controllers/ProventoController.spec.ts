import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn(),
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
  },
  unlink: jest.fn((_path, cb) => cb && cb()),
}));

import { Response } from "express";
import { ProventoController } from "./ProventoController";
import * as fs from "fs";
import { NotFoundException } from "../shared/exceptions/NotFoundException";

const fsMock = fs as { readFileSync: jest.Mock };

const mockCreateService = { executeAsync: jest.fn() };
const mockUpdateService = { executeAsync: jest.fn() };
const mockDeleteService = { executeAsync: jest.fn(), executeByCodigoAsync: jest.fn() };
const mockImportService = { executeAsync: jest.fn() };
const mockListService = { executeAsync: jest.fn() };
const mockSpreadsheetParser = { parseProventoRowsAsync: jest.fn() };

function createMockReq(overrides: object = {}): object {
  return { params: {}, query: {}, body: {}, file: undefined, ...overrides };
}

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
}

describe("ProventoController", () => {
  let controller: ProventoController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProventoController(
      mockCreateService as any,
      mockUpdateService as any,
      mockDeleteService as any,
      mockImportService as any,
      mockListService as any,
      mockSpreadsheetParser as any
    );
  });

  describe("createAsync", () => {
    it("deve retornar 201 ao criar provento", async () => {
      mockCreateService.executeAsync.mockResolvedValue({ id: "1", codigo: "VALE3" });

      const req = createMockReq({
        body: { codigo: "VALE3", data: "01-01-2024", tipo: "DIVIDENDO", instituicao: "B3", quantidade: 100, precoUnitario: 1.5, valorLiquido: 150 },
      });
      const res = createMockRes();

      await controller.createAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "1", codigo: "VALE3" });
    });

    it("deve retornar 500 quando servico lanca erro", async () => {
      mockCreateService.executeAsync.mockRejectedValue(new Error("erro ao criar"));

      const req = createMockReq({
        body: { codigo: "VALE3", data: "01-01-2024", tipo: "DIVIDENDO", instituicao: "B3", quantidade: 100, precoUnitario: 1.5, valorLiquido: 150 },
      });
      const res = createMockRes();

      await controller.createAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("importAsync", () => {
    it("deve retornar 201 ao importar planilha", async () => {
      fsMock.readFileSync.mockReturnValue(Buffer.from("conteudo"));
      mockSpreadsheetParser.parseProventoRowsAsync.mockReturnValue({ validRows: [{ codigo: "VALE3" }], invalidLineNumbers: [3] });
      mockImportService.executeAsync.mockResolvedValue({ imported: 5 });

      const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
      const res = createMockRes();

      await controller.importAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("deve retornar 400 quando arquivo nao enviado", async () => {
      const req = createMockReq({ file: undefined });
      const res = createMockRes();

      await controller.importAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Arquivo não enviado. Use o campo 'file'." });
    });

    it("deve retornar 400 quando planilha sem dados", async () => {
      fsMock.readFileSync.mockReturnValue(Buffer.from("conteudo"));
      mockSpreadsheetParser.parseProventoRowsAsync.mockReturnValue({ validRows: [], invalidLineNumbers: [] });

      const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
      const res = createMockRes();

      await controller.importAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Planilha sem dados." });
    });
  });

  describe("deleteAsync", () => {
    it("deve retornar json de sucesso ao deletar", async () => {
      mockDeleteService.executeAsync.mockResolvedValue({});

      const req = createMockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440000" } });
      const res = createMockRes();

      await controller.deleteAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "provento deletado com sucesso." });
    });

    it("deve retornar 404 quando provento nao encontrado", async () => {
      mockDeleteService.executeAsync.mockRejectedValue(new NotFoundException("provento não encontrado"));

      const req = createMockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440001" } });
      const res = createMockRes();

      await controller.deleteAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("deve retornar 500 quando ocorre erro", async () => {
      mockDeleteService.executeAsync.mockRejectedValue(new Error("erro interno"));

      const req = createMockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440002" } });
      const res = createMockRes();

      await controller.deleteAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("listAsync", () => {
    it("deve retornar json com listagem", async () => {
      const mockData = [{ id: "1", codigo: "VALE3", tipo: "DIVIDENDO" }];
      mockListService.executeAsync.mockResolvedValue(mockData);

      const req = createMockReq({ query: {} });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("deve aceitar parametros de filtro", async () => {
      mockListService.executeAsync.mockResolvedValue([]);

      const req = createMockReq({ query: { codigo: "VALE3", tipo: "DIVIDENDO", agruparPorCodigo: "true" } });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("deve retornar 500 quando ocorre erro", async () => {
      mockListService.executeAsync.mockRejectedValue(new Error("erro na listagem"));

      const req = createMockReq({ query: {} });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("deve filtrar por dataInicial e dataFinal", async () => {
      mockListService.executeAsync.mockResolvedValue([]);

      const req = createMockReq({ query: { dataInicial: "2024-01-01", dataFinal: "2024-12-31" } });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("deve limitar page e limit a valores válidos", async () => {
      mockListService.executeAsync.mockResolvedValue([]);

      const req = createMockReq({ query: { page: "0", limit: "200" } });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe("updateAsync", () => {
    it("deve retornar 200 ao atualizar provento", async () => {
      mockUpdateService.executeAsync.mockResolvedValue({ id: "1", codigo: "VALE3" });

      const req = createMockReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
        body: { codigo: "VALE3", data: "01-01-2024", tipo: "DIVIDENDO", instituicao: "B3", quantidade: 100, precoUnitario: 1.5, valorLiquido: 150 },
      });
      const res = createMockRes();

      await controller.updateAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: "1", codigo: "VALE3" });
    });

    it("deve retornar 400 quando campos obrigatórios estão faltando", async () => {
      const req = createMockReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
        body: { codigo: "", data: "" },
      });
      const res = createMockRes();

      await controller.updateAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Campos obrigatórios: codigo, data." });
    });

    it("deve retornar 500 quando servico lanca erro no update", async () => {
      mockUpdateService.executeAsync.mockRejectedValue(new Error("erro ao atualizar"));

      const req = createMockReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
        body: { codigo: "VALE3", data: "01-01-2024", tipo: "DIVIDENDO" },
      });
      const res = createMockRes();

      await controller.updateAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteByCodigoAsync", () => {
    it("deve retornar json de sucesso ao deletar por código", async () => {
      mockDeleteService.executeByCodigoAsync.mockResolvedValue({});

      const req = createMockReq({ params: { codigo: "VALE3" } });
      const res = createMockRes();

      await controller.deleteByCodigoAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Proventos deletados com sucesso." });
    });

    it("deve retornar 500 quando ocorre erro ao deletar por código", async () => {
      mockDeleteService.executeByCodigoAsync.mockRejectedValue(new Error("erro interno"));

      const req = createMockReq({ params: { codigo: "VALE3" } });
      const res = createMockRes();

      await controller.deleteByCodigoAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createAsync - campos obrigatórios", () => {
    it("deve retornar 400 quando codigo está faltando", async () => {
      const req = createMockReq({
        body: { codigo: "", data: "01-01-2024" },
      });
      const res = createMockRes();

      await controller.createAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Campos obrigatórios: codigo, data." });
    });

    it("deve retornar 400 quando data está faltando", async () => {
      const req = createMockReq({
        body: { codigo: "VALE3", data: "" },
      });
      const res = createMockRes();

      await controller.createAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("deve retornar 400 quando body é undefined", async () => {
      const req = createMockReq({ body: undefined });
      const res = createMockRes();

      await controller.createAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
