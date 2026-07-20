import { Request, Response } from "express";
import { GoogleFinanceController } from "./GoogleFinanceController";
import type { GoogleFinanceResponse } from "../../../common/models/google-finance/GoogleFinanceResponseModel";

const mockGetDataAsync = jest.fn<Promise<GoogleFinanceResponse>, [string, string]>();

jest.mock("../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn(() => ({
      getDataAsync: mockGetDataAsync,
    })),
  },
}));

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

const fakeResponse: GoogleFinanceResponse = {
  quote: {
    ticker: "PETR4",
    exchange: "SAO",
    name: "Petrobras",
    price: 42.5,
    change: 1.2,
    changePercent: 2.91,
    previousClose: 41.3,
    currency: "BRL",
    timezone: "America/Sao_Paulo",
  },
  chart: {
    previousClose: 41.3,
    points: [
      { timestamp: 1700000000, date: "2024-01-01", price: 42.5, volume: 1000 },
    ],
  },
  updatedAt: "2024-01-01T12:00:00.000Z",
};

describe("GoogleFinanceController", () => {
  let controller: GoogleFinanceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GoogleFinanceController();
  });

  it("deve retornar dados quando ativo encontrado", async () => {
    mockGetDataAsync.mockResolvedValue(fakeResponse);

    const req = { params: { codigo: "PETR4" }, query: {} } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(mockGetDataAsync).toHaveBeenCalledWith("PETR4", "1Y");
    expect(res.json).toHaveBeenCalledWith(fakeResponse);
  });

  it("deve retornar dados quando ativo encontrado com window personalizada", async () => {
    mockGetDataAsync.mockResolvedValue(fakeResponse);

    const req = { params: { codigo: "PETR4" }, query: { window: "5Y" } } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(mockGetDataAsync).toHaveBeenCalledWith("PETR4", "5Y");
    expect(res.json).toHaveBeenCalledWith(fakeResponse);
  });

  it("deve converter codigo para maiusculas e trim", async () => {
    mockGetDataAsync.mockResolvedValue(fakeResponse);

    const req = { params: { codigo: "  petr4  " }, query: {} } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(mockGetDataAsync).toHaveBeenCalledWith("PETR4", "1Y");
  });

  it("deve retornar 400 quando codigo vazio", async () => {
    const req = { params: { codigo: "" }, query: {} } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Código do ativo é obrigatório." });
  });

  it("deve retornar 400 quando codigo undefined", async () => {
    const req = { params: {}, query: {} } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Código do ativo é obrigatório." });
  });

  it("deve retornar json com erro quando servico falha", async () => {
    mockGetDataAsync.mockRejectedValue(new Error("Serviço indisponível"));

    const req = { params: { codigo: "PETR4" }, query: {} } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.json).toHaveBeenCalledWith({
      quote: null,
      chart: null,
      updatedAt: expect.any(String),
      error: "Serviço indisponível",
    });
  });

  it("deve retornar json com erro para erro nao-Error", async () => {
    mockGetDataAsync.mockRejectedValue("string error");

    const req = { params: { codigo: "PETR4" }, query: {} } as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.json).toHaveBeenCalledWith({
      quote: null,
      chart: null,
      updatedAt: expect.any(String),
      error: "string error",
    });
  });
});
