import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  promises: {
    readFile: jest.fn(),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
  unlink: jest.fn((_path, cb) => cb && cb()),
}));

import { Response } from "express";
import { ImportController } from "./ImportController";
import * as fs from "fs";

const fsMock = fs as { promises: { readFile: jest.Mock } };

const mockParser = { parseOrderRowsAsync: jest.fn() };
const mockImportService = { executeAsync: jest.fn(), validateAsync: jest.fn() };

function createMockReq(overrides: object = {}): object {
  return { params: {}, query: {}, body: {}, file: undefined, ...overrides };
}

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("ImportController", () => {
  let controller: ImportController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ImportController(mockImportService as any, mockParser as any);
  });

  it("deve retornar 201 ao importar arquivo com dados", async () => {
    fsMock.promises.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockReturnValue([{ codigo: "VALE3", quantidade: 100 }]);
    mockImportService.validateAsync.mockResolvedValue({ hasDivergences: false, divergences: [] });
    mockImportService.executeAsync.mockResolvedValue({ imported: 5, warnings: [] });

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ imported: 5, warnings: [] });
  });

  it("deve retornar 400 quando arquivo nao enviado", async () => {
    const req = createMockReq({ file: undefined });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Arquivo não enviado. Use o campo 'file'." });
  });

  it("deve retornar 400 quando planilha sem dados", async () => {
    fsMock.promises.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockReturnValue([]);

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Planilha sem dados." });
  });

  it("deve retornar 400 quando ocorre erro no parser", async () => {
    fsMock.promises.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockImplementation(() => {
      throw new Error("Erro ao processar planilha");
    });

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Erro ao processar planilha" })
    );
  });

  it("deve retornar divergencias quando existem divergencias e confirmado nao informado", async () => {
    fsMock.promises.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockReturnValue([{ codigo: "BBDC1", quantidade: 1, valor: 0.07 }]);
    mockImportService.validateAsync.mockResolvedValue({
      hasDivergences: true,
      divergences: [
        { codigo: "BBDC1", operacao: "Venda", quantidade: 1, quantidadeDisponivel: 0, mensagem: "Ativo BBDC1 vendido sem existir no portf�lio" },
      ],
    });

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ divergencias: expect.any(Array) })
    );
  });

  it("deve retornar 201 quando confirmado=true e existem divergencias", async () => {
    fsMock.promises.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockReturnValue([{ codigo: "BBDC1", quantidade: 1, valor: 0.07 }]);
    mockImportService.executeAsync.mockResolvedValue({ imported: 1, warnings: ["Ativo BBDC1 vendido sem existir no portfólio"] });

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File, query: { confirmado: "true" } });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockImportService.executeAsync).toHaveBeenCalledWith(expect.any(Array), true);
  });

  it("deve retornar 201 quando nao ha divergencias e confirmado nao informado", async () => {
    fsMock.promises.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockReturnValue([{ codigo: "VALE3", quantidade: 100, valor: 50.0 }]);
    mockImportService.validateAsync.mockResolvedValue({ hasDivergences: false, divergences: [] });
    mockImportService.executeAsync.mockResolvedValue({ imported: 1, warnings: [] });

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
