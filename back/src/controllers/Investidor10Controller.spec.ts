import { Request, Response } from "express";
import { Investidor10Controller } from "./Investidor10Controller";

const mockScrapeAsync = jest.fn();

const mockScrapeDividendosAsync = jest.fn();

jest.mock("../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn(() => ({
      scrapeAsync: mockScrapeAsync,
      scrapeDividendosAsync: mockScrapeDividendosAsync,
    })),
  },
}));

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("Investidor10Controller", () => {
  let controller: Investidor10Controller;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new Investidor10Controller();
  });

  it("deve retornar json com dados quando ativo encontrado", async () => {
    mockScrapeAsync.mockResolvedValue({
      codigo: "VIVT3",
      empresa: "VIVO - TELEFÔNICA BRASIL",
      dadosSobreEmpresa: [],
      informacoesSobreEmpresa: [],
      indicadoresFundamentalistas: [],
    });

    const req = { params: { codigo: "VIVT3" } } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.json).toHaveBeenCalledWith({
      codigo: "VIVT3",
      empresa: "VIVO - TELEFÔNICA BRASIL",
      dadosSobreEmpresa: [],
      informacoesSobreEmpresa: [],
      indicadoresFundamentalistas: [],
    });
  });

  it("deve retornar 400 quando codigo vazio", async () => {
    const req = { params: { codigo: "" } } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Código do ativo é obrigatório." });
  });

  it("deve retornar 502 quando falha ao consultar Investidor10", async () => {
    mockScrapeAsync.mockRejectedValue(new Error("Falha ao consultar Investidor10"));

    const req = { params: { codigo: "VIVT3" } } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ message: "Falha ao consultar Investidor10" });
  });

  it("deve retornar 502 quando nao foi possivel extrair dados", async () => {
    mockScrapeAsync.mockRejectedValue(new Error("Não foi possível extrair dados"));

    const req = { params: { codigo: "VIVT3" } } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ message: "Não foi possível extrair dados" });
  });

  it("deve retornar 500 para erro generico", async () => {
    mockScrapeAsync.mockRejectedValue(new Error("erro inesperado"));

    const req = { params: { codigo: "VIVT3" } } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Erro interno do servidor" })
    );
  });

  describe("getProventosAsync", () => {
    it("deve retornar json com proventos quando ativo encontrado", async () => {
      mockScrapeDividendosAsync.mockResolvedValue({
        codigo: "VIVT3",
        proventos: [
          { data: "01/01/2024", valor: "1.50", tipo: "DIVIDENDO" },
        ],
      });

      const req = { params: { codigo: "VIVT3" } } as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.json).toHaveBeenCalledWith({
        codigo: "VIVT3",
        proventos: [
          { data: "01/01/2024", valor: "1.50", tipo: "DIVIDENDO" },
        ],
      });
    });

    it("deve retornar 400 quando codigo vazio", async () => {
      const req = { params: { codigo: "" } } as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Código do ativo é obrigatório." });
    });

    it("deve retornar 502 quando falha ao consultar Investidor10", async () => {
      mockScrapeDividendosAsync.mockRejectedValue(
        new Error("Falha ao consultar Investidor10 para o ativo VIVT3.")
      );

      const req = { params: { codigo: "VIVT3" } } as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({ message: "Falha ao consultar Investidor10 para o ativo VIVT3." });
    });

    it("deve retornar 502 quando nao foi possivel extrair dados", async () => {
      mockScrapeDividendosAsync.mockRejectedValue(
        new Error("Não foi possível extrair dados")
      );

      const req = { params: { codigo: "VIVT3" } } as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({ message: "Não foi possível extrair dados" });
    });

    it("deve retornar 500 para erro generico", async () => {
      mockScrapeDividendosAsync.mockRejectedValue(new Error("erro inesperado"));

      const req = { params: { codigo: "VIVT3" } } as Request;
      const res = createMockRes();

      await controller.getProventosAsync(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Erro interno do servidor" })
      );
    });
  });
});
