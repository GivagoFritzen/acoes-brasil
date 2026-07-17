import { Request, Response } from "express";
import { YahooFinanceController } from "./YahooFinanceController";

const mockScrapeAsync = jest.fn();

jest.mock("../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn(() => ({
      scrapeAsync: mockScrapeAsync,
    })),
  },
}));

function createMockRes(): Response {
  const res = {} as any;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("YahooFinanceController", () => {
  let controller: YahooFinanceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new YahooFinanceController();
  });

  it("Deve retornar json com dados quando ativo encontrado", async () => {
    mockScrapeAsync.mockResolvedValue({
      codigo: "VALE3",
      keyStatistics: { enterpriseValue: "404.72B" },
      financialData: { currentPrice: "74.51" },
      incomeStatements: [],
      balanceSheets: [],
      cashflowStatements: [],
      earningsHistory: [],
      calendarEvents: null,
    });

    const req = { params: { codigo: "VALE3" } } as unknown as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.json).toHaveBeenCalledWith({
      codigo: "VALE3",
      keyStatistics: { enterpriseValue: "404.72B" },
      financialData: { currentPrice: "74.51" },
      incomeStatements: [],
      balanceSheets: [],
      cashflowStatements: [],
      earningsHistory: [],
      calendarEvents: null,
    });
  });

  it("Deve retornar 400 quando codigo vazio", async () => {
    const req = { params: { codigo: "" } } as unknown as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Código do ativo é obrigatório." });
  });

  it("Deve retornar 502 quando falha ao consultar Yahoo Finance", async () => {
    mockScrapeAsync.mockRejectedValue(new Error("Falha ao consultar Yahoo Finance para o ativo VALE3."));

    const req = { params: { codigo: "VALE3" } } as unknown as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ message: "Falha ao consultar Yahoo Finance para o ativo VALE3." });
  });

  it("Deve retornar 502 quando autenticacao falha", async () => {
    mockScrapeAsync.mockRejectedValue(new Error("Falha ao autenticar no Yahoo Finance."));

    const req = { params: { codigo: "VALE3" } } as unknown as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
  });

  it("Deve retornar 500 para erro generico", async () => {
    mockScrapeAsync.mockRejectedValue(new Error("erro inesperado"));

    const req = { params: { codigo: "VALE3" } } as unknown as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
