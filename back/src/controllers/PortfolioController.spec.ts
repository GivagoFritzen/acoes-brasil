import { Response } from "express";
import { PortfolioController } from "./PortfolioController";

const mockCreateOrUpdateService = { executeAsync: jest.fn() };
const mockDeleteService = { executeAsync: jest.fn() };
const mockListService = { executeAsync: jest.fn() };

jest.mock("../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      switch (name) {
        case "CreateOrUpdatePortfolioService": return mockCreateOrUpdateService;
        case "DeletePortfolioService": return mockDeleteService;
        case "ListPortfolioService": return mockListService;
        default: return {};
      }
    }),
  },
}));

function createMockReq(overrides: Partial<any> = {}): any {
  return { params: {}, query: {}, body: {}, ...overrides };
}

function createMockRes(): Response {
  const res = {} as any;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("PortfolioController", () => {
  let controller: PortfolioController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PortfolioController();
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
      mockDeleteService.executeAsync.mockRejectedValue(new Error("Ativo do portfólio não encontrado"));

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
});
