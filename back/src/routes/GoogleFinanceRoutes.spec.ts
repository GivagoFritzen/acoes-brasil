import request from "supertest";
import express from "express";
import { googleFinanceRoutes } from "./GoogleFinanceRoutes";

const mockGetDataAsync = jest.fn();

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "googleFinanceService") {
        return { getDataAsync: mockGetDataAsync };
      }
      return {};
    }),
  },
}));

describe("googleFinanceRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/google-finance", googleFinanceRoutes);
  });

  describe("GET /:codigo", () => {
    it("deve retornar 200 com dados do ativo", async () => {
      mockGetDataAsync.mockResolvedValue({
        quote: { ticker: "PETR4", price: 42.5 },
        chart: { previousClose: 41.3, points: [] },
        updatedAt: "2024-01-01T12:00:00.000Z",
      });

      const response = await request(app).get("/google-finance/PETR4");

      expect(response.status).toBe(200);
      expect(response.body.quote.ticker).toBe("PETR4");
    });

    it("deve passar chartWindow como query param", async () => {
      mockGetDataAsync.mockResolvedValue({
        quote: null, chart: null, updatedAt: "",
      });

      await request(app).get("/google-finance/PETR4?window=5Y");

      expect(mockGetDataAsync).toHaveBeenCalledWith("PETR4", "5Y");
    });

    it("deve retornar 400 quando codigo vazio apos trim", async () => {
      const response = await request(app).get("/google-finance/%20%20");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Código do ativo é obrigatório.");
    });

    it("deve retornar 404 quando rota nao encontrada", async () => {
      const response = await request(app).get("/google-finance/");

      expect(response.status).toBe(404);
    });

    it("deve retornar 200 com erro no body quando servico falha", async () => {
      mockGetDataAsync.mockRejectedValue(new Error("API error"));

      const response = await request(app).get("/google-finance/PETR4");

      expect(response.status).toBe(200);
      expect(response.body.quote).toBeNull();
      expect(response.body.chart).toBeNull();
      expect(response.body.error).toBe("API error");
    });
  });
});
