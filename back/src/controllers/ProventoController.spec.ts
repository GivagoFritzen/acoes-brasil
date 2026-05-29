import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn(),
  unlink: jest.fn((_path, cb) => cb && cb()),
}));

import { Response } from "express";
import { ProventoController } from "./ProventoController";
import * as fs from "fs";

const fsMock = fs as unknown as { readFileSync: jest.Mock };

const mockCreateService = { executeAsync: jest.fn() };
const mockDeleteService = { executeAsync: jest.fn() };
const mockImportService = { executeAsync: jest.fn() };
const mockListService = { executeAsync: jest.fn() };
const mockSpreadsheetParser = { parseProventoRowsAsync: jest.fn() };

jest.mock("../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      switch (name) {
        case "CreateProventoService": return mockCreateService;
        case "DeleteProventoService": return mockDeleteService;
        case "ImportProventosService": return mockImportService;
        case "ListProventosService": return mockListService;
        case "spreadsheetParser": return mockSpreadsheetParser;
        default: return {};
      }
    }),
  },
}));

function createMockReq(overrides: Partial<any> = {}): any {
  return { params: {}, query: {}, body: {}, file: undefined, ...overrides };
}

function createMockRes(): Response {
  const res = {} as any;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
}

describe("ProventoController", () => {
  let controller: ProventoController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProventoController();
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
      mockDeleteService.executeAsync.mockRejectedValue(new Error("provento não encontrado"));

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
  });
});
