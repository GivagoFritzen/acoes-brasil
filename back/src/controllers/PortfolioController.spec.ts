import { Response } from "express";
import fs from "fs";
import { PortfolioController } from "./PortfolioController";
import { NotFoundException } from "../shared/exceptions/NotFoundException";

const mockCreateOrUpdateService = { executeAsync: jest.fn() };
const mockDeleteService = { executeAsync: jest.fn() };
const mockListService = { executeAsync: jest.fn() };
const mockExportService = { executeAsync: jest.fn() };
const mockImportService = { executeAsync: jest.fn() };
const mockSpreadsheetParser = { parsePortfolioRowsAsync: jest.fn() };

const XLSX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

function createMockReq(overrides: object = {}): object {
  return { params: {}, query: {}, body: {}, file: undefined, ...overrides };
}

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.setHeader = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
}

describe("PortfolioController", () => {
  let controller: PortfolioController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PortfolioController(
      mockCreateOrUpdateService as any,
      mockDeleteService as any,
      mockListService as any,
      mockExportService as any,
      mockImportService as any,
      mockSpreadsheetParser as any
    );
  });

  describe("createOrUpdateAsync", () => {
    it("deve retornar 201 ao criar portfolio", async () => {
      mockCreateOrUpdateService.executeAsync.mockResolvedValue({ created: true, portfolio: { id: "1", codigo: "VALE3" } });

      const req = createMockReq({ body: { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 } });
      const res = createMockRes();

      await controller.createOrUpdateAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "1", codigo: "VALE3" });
    });

    it("deve retornar 200 ao atualizar portfolio existente", async () => {
      mockCreateOrUpdateService.executeAsync.mockResolvedValue({ created: false, portfolio: { id: "1", codigo: "VALE3" } });

      const req = createMockReq({ body: { codigo: "VALE3", quantidade: 200, precoMedio: 55.0 } });
      const res = createMockRes();

      await controller.createOrUpdateAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: "1", codigo: "VALE3" });
    });

    it("deve retornar 500 quando servico lanca erro", async () => {
      mockCreateOrUpdateService.executeAsync.mockRejectedValue(new Error("erro ao salvar"));

      const req = createMockReq({ body: { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 } });
      const res = createMockRes();

      await controller.createOrUpdateAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteAsync", () => {
    it("deve retornar json de sucesso ao deletar", async () => {
      mockDeleteService.executeAsync.mockResolvedValue({});

      const req = createMockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440000" } });
      const res = createMockRes();

      await controller.deleteAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Ativo do portfólio deletado com sucesso." });
    });

    it("deve retornar 404 quando ativo nao encontrado", async () => {
      mockDeleteService.executeAsync.mockRejectedValue(new NotFoundException("Ativo do portfólio não encontrado"));

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
      const mockData = [{ id: "1", codigo: "VALE3", quantidade: 100 }];
      mockListService.executeAsync.mockResolvedValue(mockData);

      const req = createMockReq();
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("deve retornar 500 quando ocorre erro", async () => {
      mockListService.executeAsync.mockRejectedValue(new Error("erro na listagem"));

      const req = createMockReq();
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("exportPortfolioAsync", () => {
    it("deve exportar portfolio e retornar buffer com headers", async () => {
      const buffer = Buffer.from("fake-xlsx-content");
      mockExportService.executeAsync.mockResolvedValue({ buffer, fileName: "portfolio-20240101.xlsx" });

      const req = createMockReq();
      const res = createMockRes();

      await controller.exportPortfolioAsync(req, res);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Disposition", 'attachment; filename="portfolio-20240101.xlsx"');
      expect(res.send).toHaveBeenCalledWith(buffer);
    });

    it("deve retornar 500 quando servico lanca erro", async () => {
      mockExportService.executeAsync.mockRejectedValue(new Error("erro ao exportar"));

      const req = createMockReq();
      const res = createMockRes();

      await controller.exportPortfolioAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("importPortfolioAsync", () => {
    const filePath = "/tmp/test-file.xlsx";

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("deve importar portfolio com arquivo xlsx valido", async () => {
      jest.spyOn(fs, "readFileSync").mockReturnValue(XLSX_MAGIC);
      mockSpreadsheetParser.parsePortfolioRowsAsync.mockReturnValue([
        { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 },
      ]);
      mockImportService.executeAsync.mockResolvedValue(1);

      const req = createMockReq({ file: { path: filePath } });
      const res = createMockRes();

      await controller.importPortfolioAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ imported: 1 });
    });

    it("deve retornar 400 quando arquivo nao enviado", async () => {
      const req = createMockReq();
      const res = createMockRes();

      await controller.importPortfolioAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Arquivo não enviado. Use o campo 'file'." });
    });

    it("deve retornar 400 quando tipo de arquivo invalido", async () => {
      jest.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from([0x00, 0x00, 0x00, 0x00]));

      const req = createMockReq({ file: { path: filePath } });
      const res = createMockRes();

      await controller.importPortfolioAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Tipo de arquivo inválido. Envie um arquivo .xlsx válido." });
    });

    it("deve retornar 400 quando planilha sem dados", async () => {
      jest.spyOn(fs, "readFileSync").mockReturnValue(XLSX_MAGIC);
      mockSpreadsheetParser.parsePortfolioRowsAsync.mockReturnValue([]);

      const req = createMockReq({ file: { path: filePath } });
      const res = createMockRes();

      await controller.importPortfolioAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Planilha sem dados." });
    });

    it("deve retornar 400 quando erro no servico de importacao", async () => {
      jest.spyOn(fs, "readFileSync").mockReturnValue(XLSX_MAGIC);
      mockSpreadsheetParser.parsePortfolioRowsAsync.mockReturnValue([
        { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 },
      ]);
      mockImportService.executeAsync.mockRejectedValue(new Error("erro na importacao"));

      const req = createMockReq({ file: { path: filePath } });
      const res = createMockRes();

      await controller.importPortfolioAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao importar planilha de portfólio", error: "erro na importacao" });
    });

    it("deve deletar arquivo temporario apos importacao bem sucedida", async () => {
      const unlinkSpy = jest.spyOn(fs, "unlink").mockImplementation((_path, cb) => cb());
      jest.spyOn(fs, "readFileSync").mockReturnValue(XLSX_MAGIC);
      mockSpreadsheetParser.parsePortfolioRowsAsync.mockReturnValue([]);

      const req = createMockReq({ file: { path: filePath } });
      const res = createMockRes();

      await controller.importPortfolioAsync(req, res);

      expect(unlinkSpy).toHaveBeenCalledWith(filePath, expect.any(Function));
    });
  });
});
