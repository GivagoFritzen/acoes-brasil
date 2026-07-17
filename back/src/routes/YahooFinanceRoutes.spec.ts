import request from "supertest";
import express from "express";
import { yahooFinanceRoutes } from "./YahooFinanceRoutes";

const mockScrapeAsync = jest.fn();

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "yahooFinanceScraper") {
        return {
          scrapeAsync: mockScrapeAsync,
        };
      }
      return {};
    }),
  },
}));

describe("yahooFinanceRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/yahoo-finance", yahooFinanceRoutes);
  });

  describe("GET /:codigo", () => {
    it("Deve responder com status 200 quando ativo encontrado", async () => {
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

      const response = await request(app).get("/yahoo-finance/VALE3");

      expect(response.status).toBe(200);
      expect(response.body.codigo).toBe("VALE3");
      expect(response.body.keyStatistics.enterpriseValue).toBe("404.72B");
    });

    it("Deve obter servico do container", async () => {
      mockScrapeAsync.mockResolvedValue({ codigo: "VALE3" });

      await request(app).get("/yahoo-finance/VALE3");

      const { Container: container } = jest.requireMock("../../shared/dependency-injection/Container");
      expect(container.get).toHaveBeenCalledWith("yahooFinanceScraper");
    });

    it("Deve responder com status 400 quando codigo vazio", async () => {
      const response = await request(app).get("/yahoo-finance/");

      expect(response.status).toBe(404);
    });

    it("Deve responder com status 502 quando consulta falha", async () => {
      mockScrapeAsync.mockRejectedValue(
        new Error("Falha ao consultar Yahoo Finance para o ativo VALE3.")
      );

      const response = await request(app).get("/yahoo-finance/VALE3");

      expect(response.status).toBe(502);
      expect(response.body.message).toContain("Falha ao consultar Yahoo Finance");
    });
  });
});
