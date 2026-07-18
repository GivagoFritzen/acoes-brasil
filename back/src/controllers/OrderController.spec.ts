import { Response } from "express";
import { OrderController } from "./OrderController";
import { NotFoundException } from "../shared/exceptions/NotFoundException";

const mockCreateService = { executeAsync: jest.fn() };
const mockDeleteService = { executeAsync: jest.fn() };
const mockListService = { executeAsync: jest.fn() };
const mockGetSellSnapshotsService = { executeAsync: jest.fn() };
const mockExportSellSnapshotsService = { executeAsync: jest.fn() };

function createMockReq(overrides: object = {}): object {
  return {
    params: {},
    query: {},
    body: {},
    ...overrides,
  };
}

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  res.setHeader = jest.fn().mockReturnThis();
  return res;
}

describe("OrderController", () => {
  let controller: OrderController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrderController(
      mockCreateService as any,
      mockDeleteService as any,
      mockListService as any,
      mockGetSellSnapshotsService as any,
      mockExportSellSnapshotsService as any
    );
  });

  describe("createAsync", () => {
    it("deve retornar 201 ao criar ordem", async () => {
      mockCreateService.executeAsync.mockResolvedValue({ id: "1" });

      const req = createMockReq();
      (req as any).validatedBody = { codigo: "VALE3", quantidade: 100, valor: 50, data: "01-01-2024", tipo: "ACAO", operacao: "Compra" };
      const res = createMockRes();

      await controller.createAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "1" });
    });

    it("deve retornar 500 quando servico lanca erro generico", async () => {
      mockCreateService.executeAsync.mockRejectedValue(new Error("erro no banco"));

      const req = createMockReq();
      (req as any).validatedBody = { codigo: "VALE3", quantidade: 100, valor: 50, data: "01-01-2024", tipo: "ACAO", operacao: "Compra" };
      const res = createMockRes();

      await controller.createAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erro interno do servidor" })
      );
    });
  });

  describe("deleteAsync", () => {
    it("deve retornar json de sucesso ao deletar ordem", async () => {
      mockDeleteService.executeAsync.mockResolvedValue({});

      const req = createMockReq({ params: { id: "550e8400-e29b-41d4-a716-446655440000" } });
      const res = createMockRes();

      await controller.deleteAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Ordem deletada com sucesso." });
    });

    it("deve retornar 404 quando ordem nao encontrada", async () => {
      mockDeleteService.executeAsync.mockRejectedValue(new NotFoundException("Ordem não encontrada"));

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
    it("deve retornar json com listagem de ordens", async () => {
      const mockData = { items: [{ id: "1", codigo: "VALE3" }], total: 1 };
      mockListService.executeAsync.mockResolvedValue(mockData);

      const req = createMockReq({ query: {} });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("deve aceitar parametros de filtro", async () => {
      mockListService.executeAsync.mockResolvedValue({ items: [], total: 0 });

      const req = createMockReq({ query: { codigo: "VALE3", operacao: "Compra", page: "1", limit: "10" } });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.json).toHaveBeenCalled();
    });

    it("deve retornar 500 quando ocorre erro", async () => {
      mockListService.executeAsync.mockRejectedValue(new Error("erro na listagem"));

      const req = createMockReq({ query: {} });
      const res = createMockRes();

      await controller.listAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getSellSnapshotsDataAsync", () => {
    it("deve retornar json com dados", async () => {
      const mockData = [{ ticker: "VALE3", quantity: 100 }];
      mockGetSellSnapshotsService.executeAsync.mockResolvedValue(mockData);

      const req = createMockReq();
      const res = createMockRes();

      await controller.getSellSnapshotsDataAsync(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("deve passar ano como parametro quando informado", async () => {
      mockGetSellSnapshotsService.executeAsync.mockResolvedValue([]);

      const req = createMockReq({ query: { ano: "2024" } });
      const res = createMockRes();

      await controller.getSellSnapshotsDataAsync(req, res);

      expect(mockGetSellSnapshotsService.executeAsync).toHaveBeenCalledWith("2024");
    });
  });

  describe("exportSellSnapshotsAsync", () => {
    it("deve retornar arquivo Excel com headers corretos", async () => {
      const mockBuffer = Buffer.from("excel-data");
      mockExportSellSnapshotsService.executeAsync.mockResolvedValue({ buffer: mockBuffer, fileName: "export.xlsx" });

      const req = createMockReq();
      const res = createMockRes();

      await controller.exportSellSnapshotsAsync(req, res);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Disposition", 'attachment; filename="export.xlsx"');
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });

    it("deve passar ano como parametro quando informado", async () => {
      mockExportSellSnapshotsService.executeAsync.mockResolvedValue({ buffer: Buffer.from("test"), fileName: "vendas.xlsx" });

      const req = createMockReq({ query: { ano: "2025" } });
      const res = createMockRes();

      await controller.exportSellSnapshotsAsync(req, res);

      expect(mockExportSellSnapshotsService.executeAsync).toHaveBeenCalledWith("2025");
    });
  });
});
