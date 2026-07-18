import { Request, Response } from "express";
import { TradingHoursController } from "./TradingHoursController";

const mockScrapeAsync = jest.fn();

jest.mock("../infrastructure/services/TradingHoursScraperService", () => ({
  TradingHoursScraperService: jest.fn().mockImplementation(() => ({
    scrapeAsync: mockScrapeAsync,
  })),
}));

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("TradingHoursController", () => {
  let controller: TradingHoursController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TradingHoursController();
  });

  it("deve retornar dados de horario com sucesso", async () => {
    mockScrapeAsync.mockResolvedValue({
      isOpen: true,
      openTime: "10:00",
      closeTime: "16:55",
      timezone: "America/Sao_Paulo",
      tradingDays: [1, 2, 3, 4, 5],
    });

    const req = {} as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        id: "bvmf",
        name: "B3",
        shortName: "B3",
        country: "BR",
        region: "BR",
        timezone: "America/Sao_Paulo",
        currency: "BRL",
        marketCap: "",
        location: "São Paulo",
        website: "https://www.b3.com.br",
        openTime: "10:00",
        closeTime: "16:55",
        isOpen: true,
        holidays: [],
        tradingDays: [1, 2, 3, 4, 5],
        nextOpenTime: "",
        currentStatus: {
          marketId: "bvmf",
          isOpen: true,
          status: "open",
          nextChange: "",
          localTime: "",
          marketTime: "",
        },
        upcomingHolidays: [],
      },
    });
  });

  it("deve retornar 500 quando scrape falha", async () => {
    mockScrapeAsync.mockRejectedValue(new Error("erro"));

    const req = {} as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erro ao obter status do mercado",
    });
  });

  it("deve marcar currentStatus como closed quando mercado fechado", async () => {
    mockScrapeAsync.mockResolvedValue({
      isOpen: false,
      openTime: "10:00",
      closeTime: "16:55",
      timezone: "America/Sao_Paulo",
      tradingDays: [1, 2, 3, 4, 5],
    });

    const req = {} as Request;
    const res = createMockRes();

    await controller.getAsync(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentStatus: expect.objectContaining({
            isOpen: false,
            status: "closed",
          }),
        }),
      })
    );
  });
});
