import request from "supertest";
import express from "express";
import { portfolioRoutes } from "../portfolioRoutes";

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "createOrUpdatePortfolioService") {
        return {
          executeAsync: jest.fn().mockResolvedValue({ created: true, portfolio: { id: "1" } }),
        };
      }
      if (name === "deletePortfolioService") {
        return {
          executeAsync: jest.fn().mockResolvedValue({}),
        };
      }
      if (name === "listPortfolioService") {
        return {
          executeAsync: jest.fn().mockResolvedValue([]),
        };
      }
      return {};
    }),
  },
}));

describe("portfolioRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/portfolios", portfolioRoutes);
  });

  describe("POST /", () => {
    it("Deve responder com status 201 ao criar portfolio", async () => {
      const response = await request(app)
        .post("/portfolios")
        .send({
          codigo: "VALE3",
          quantidade: 100,
          precoMedio: 50.0,
        });

      expect(response.status).toBe(201);
    });
  });

  describe("GET /", () => {
    it("Deve responder com status 200 ao listar portfolios", async () => {
      const response = await request(app).get("/portfolios");

      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /:id", () => {
    it("Deve responder com status 200 ao deletar portfolio", async () => {
      const response = await request(app).delete("/portfolios/1");

      expect(response.status).toBe(200);
    });
  });
});
