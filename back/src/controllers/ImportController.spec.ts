import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn(),
  unlink: jest.fn((_path, cb) => cb && cb()),
}));

import { Response } from "express";
import { ImportController } from "./ImportController";
import * as fs from "fs";

const fsMock = fs as { readFileSync: jest.Mock };

const mockParser = { parseOrderRowsAsync: jest.fn() };
const mockImportService = { executeAsync: jest.fn() };

jest.mock("../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      switch (name) {
        case "spreadsheetParser": return mockParser;
        case "ImportOrdersService": return mockImportService;
        default: return {};
      }
    }),
  },
}));

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
    controller = new ImportController();
  });

  it("deve retornar 201 ao importar arquivo com dados", async () => {
    fsMock.readFileSync.mockReturnValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockReturnValue([{ codigo: "VALE3", quantidade: 100 }]);
    mockImportService.executeAsync.mockResolvedValue(5);

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ imported: 5 });
  });

  it("deve retornar 400 quando arquivo nao enviado", async () => {
    const req = createMockReq({ file: undefined });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Arquivo não enviado. Use o campo 'file'." });
  });

  it("deve retornar 400 quando planilha sem dados", async () => {
    fsMock.readFileSync.mockReturnValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockReturnValue([]);

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Planilha sem dados." });
  });

  it("deve retornar 400 quando ocorre erro no parser", async () => {
    fsMock.readFileSync.mockReturnValue(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    mockParser.parseOrderRowsAsync.mockImplementation(() => {
      throw new Error("Erro ao processar planilha");
    });

    const req = createMockReq({ file: { path: "/tmp/test.xlsx" } as Express.Multer.File });
    const res = createMockRes();

    await controller.importAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Erro ao importar planilha de negociação" })
    );
  });
});
