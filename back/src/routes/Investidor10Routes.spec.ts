import request from "supertest";
import express from "express";
import { investidor10Routes } from "./Investidor10Routes";

const mockScrapeAsync = jest.fn();
const mockScrapeDividendosAsync = jest.fn();

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "investidor10Scraper") {
        return {
          scrapeAsync: mockScrapeAsync,
          scrapeDividendosAsync: mockScrapeDividendosAsync,
        };
      }
      return {};
    }),
  },
}));

describe("investidor10Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/investidor10", investidor10Routes);
  });

  describe("GET /:codigo", () => {
    it("Deve responder com status 200 quando ativo encontrado", async () => {
      mockScrapeAsync.mockResolvedValue({
        codigo: "VIVT3",
        empresa: "VIVO - TELEFÔNICA BRASIL",
        dadosSobreEmpresa: [],
        informacoesSobreEmpresa: [],
        indicadoresFundamentalistas: [],
      });

      const response = await request(app).get("/investidor10/VIVT3");

      expect(response.status).toBe(200);
      expect(response.body.codigo).toBe("VIVT3");
    });

    it("Deve obter servico do container", async () => {
      mockScrapeAsync.mockResolvedValue({ codigo: "VIVT3" });

      await request(app).get("/investidor10/VIVT3");

      const { Container: container } = jest.requireMock("../../shared/dependency-injection/Container");
      expect(container.get).toHaveBeenCalledWith("investidor10Scraper");
    });
  });

  describe("GET /:codigo/proventos", () => {
    it("Deve responder com status 200 quando proventos encontrados", async () => {
      mockScrapeDividendosAsync.mockResolvedValue({
        codigo: "VIVT3",
        proventos: [{ data: "01/01/2024", valor: "1.50", tipo: "DIVIDENDO" }],
      });

      const response = await request(app).get("/investidor10/VIVT3/proventos");

      expect(response.status).toBe(200);
      expect(response.body.proventos).toHaveLength(1);
    });

    it("Deve retornar 502 quando consulta falha", async () => {
      mockScrapeDividendosAsync.mockRejectedValue(
        new Error("Falha ao consultar Investidor10 para o ativo VIVT3.")
      );

      const response = await request(app).get("/investidor10/VIVT3/proventos");

      expect(response.status).toBe(502);
    });
  });
});
