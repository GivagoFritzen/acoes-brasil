import request from "supertest";
import express from "express";
import { fundamentusRoutes } from "./FundamentusRoutes";

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "fundamentusScraper") {
        return {
          scrapeAsync: jest.fn().mockResolvedValue({
            codigo: "PETR4",
            empresa: "Petrobras",
            cotacao: 50.0,
          }),
        };
      }
      return {};
    }),
  },
}));

describe("fundamentusRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/fundamentus", fundamentusRoutes);
  });

  describe("GET /:codigo", () => {
    it("Deve responder com status 200 quando ativo encontrado", async () => {
      const response = await request(app).get("/fundamentus/PETR4");

      expect(response.status).toBe(200);
      expect(response.body.codigo).toBe("PETR4");
    });

    it("Deve passar codigo na requisicao", async () => {
      await request(app).get("/fundamentus/PETR4");

      const { Container: container } = jest.requireMock("../../shared/dependency-injection/Container");
      expect(container.get).toHaveBeenCalledWith("fundamentusScraper");
    });
  });
});
