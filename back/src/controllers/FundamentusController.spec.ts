import { Request, Response } from "express";
import { FundamentusController } from "./FundamentusController";

const mockScrapeAsync = jest.fn();
const mockProventosScrapeAsync = jest.fn();

jest.mock("../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "fundamentusProventosScraper") {
        return { scrapeAsync: mockProventosScrapeAsync };
      }
      return { scrapeAsync: mockScrapeAsync };
    }),
  },
}));

function createMockRes(): Response {
  const res = {} as any;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("FundamentusController", () => {
  let controller: FundamentusController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new FundamentusController();
  });

  describe("getAsync", () => {
    it("deve retornar json com dados quando ativo encontrado", async () => {
      mockScrapeAsync.mockResolvedValue({ codigo: "PETR4", cotacao: 50.0 });

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({ codigo: "PETR4", cotacao: 50.0 });
    });

    it("deve retornar 400 quando codigo vazio", async () => {
      const req = { params: { codigo: "" } } as unknown as Request;
      const res = createMockRes();

      await controller.getAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Código do ativo é obrigatório." });
    });

    it("deve retornar 404 quando ativo nao encontrado no Fundamentus", async () => {
      mockScrapeAsync.mockRejectedValue(new Error("PETR4 não encontrado no Fundamentus"));

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "PETR4 não encontrado no Fundamentus" });
    });

    it("deve retornar 502 quando falha ao consultar Fundamentus", async () => {
      mockScrapeAsync.mockRejectedValue(new Error("Falha ao consultar Fundamentus"));

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({ message: "Falha ao consultar Fundamentus" });
    });

    it("deve retornar 502 quando nao foi possivel extrair dados", async () => {
      mockScrapeAsync.mockRejectedValue(new Error("Não foi possível extrair dados"));

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({ message: "Não foi possível extrair dados" });
    });

    it("deve retornar 500 para erro generico", async () => {
      mockScrapeAsync.mockRejectedValue(new Error("erro inesperado"));

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erro interno do servidor" })
      );
    });
  });

  describe("getProventosAsync", () => {
    it("deve retornar json com proventos quando ativo encontrado", async () => {
      mockProventosScrapeAsync.mockResolvedValue({
        codigo: "PETR4",
        proventos: [{ data: "01/01/2024", tipo: "DIVIDENDO", valor: "1.50" }],
      });

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({
        codigo: "PETR4",
        proventos: [{ data: "01/01/2024", tipo: "DIVIDENDO", valor: "1.50" }],
      });
    });

    it("deve retornar 400 quando codigo vazio", async () => {
      const req = { params: { codigo: "" } } as unknown as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Código do ativo é obrigatório." });
    });

    it("deve retornar 502 quando falha ao consultar Fundamentus", async () => {
      mockProventosScrapeAsync.mockRejectedValue(new Error("Falha ao consultar Fundamentus para o ativo PETR4."));

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({ message: "Falha ao consultar Fundamentus para o ativo PETR4." });
    });

    it("deve retornar 500 para erro generico", async () => {
      mockProventosScrapeAsync.mockRejectedValue(new Error("erro inesperado"));

      const req = { params: { codigo: "PETR4" } } as unknown as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erro interno do servidor" })
      );
    });
  });
});
