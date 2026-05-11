import request from "supertest";
import express from "express";
import { orderRoutes } from "../orderRoutes";

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "createOrderService") {
        return {
          executeAsync: jest.fn().mockResolvedValue({ id: "1" }),
        };
      }
      if (name === "deleteOrderService") {
        return {
          executeAsync: jest.fn().mockResolvedValue({}),
        };
      }
      if (name === "listOrdersService") {
        return {
          executeAsync: jest.fn().mockResolvedValue({ items: [], total: 0 }),
        };
      }
      if (name === "getSellSnapshotsService") {
        return {
          executeAsync: jest.fn().mockResolvedValue([]),
        };
      }
      if (name === "exportSellSnapshotsService") {
        return {
          executeAsync: jest.fn().mockResolvedValue({ buffer: Buffer.from("test"), fileName: "test.xlsx" }),
        };
      }
      if (name === "importOrdersService") {
        return {
          executeAsync: jest.fn().mockResolvedValue(5),
        };
      }
      if (name === "spreadsheetParser") {
        return {
          parseOrderRowsAsync: jest.fn().mockReturnValue([{ codigo: "VALE3" }]),
        };
      }
      return {};
    }),
  },
}));

describe("orderRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/orders", orderRoutes);
  });

  describe("POST /", () => {
    it("Deve responder com status 201 ao criar ordem", async () => {
      const response = await request(app)
        .post("/orders")
        .send({
          codigo: "VALE3",
          quantidade: 100,
          valor: 50.0,
          data: "2024-01-01",
          tipo: "ACAO",
          operacao: "Compra",
        });

      expect(response.status).toBe(201);
    });
  });

  describe("POST /import", () => {
    it("Deve responder com status 201 ao importar arquivo", async () => {
      const response = await request(app)
        .post("/orders/import")
        .attach("file", Buffer.from("test"), "test.xlsx");

      expect(response.status).toBe(201);
    });
  });

  describe("DELETE /:id", () => {
    it("Deve responder com status 200 ao deletar ordem", async () => {
      const response = await request(app).delete("/orders/1");

      expect(response.status).toBe(200);
    });
  });

  describe("GET /", () => {
    it("Deve responder com status 200 ao listar ordens", async () => {
      const response = await request(app).get("/orders");

      expect(response.status).toBe(200);
    });

    it("Deve aceitar parametros de filtro", async () => {
      const response = await request(app)
        .get("/orders")
        .query({ page: 1, limit: 20, codigo: "VALE3" });

      expect(response.status).toBe(200);
    });
  });

  describe("GET /export/sell-snapshots", () => {
    it("Deve responder com arquivo Excel", async () => {
      const response = await request(app).get("/orders/export/sell-snapshots");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("spreadsheetml");
    });
  });

  describe("GET /export/sell-snapshots/data", () => {
    it("Deve responder com dados JSON", async () => {
      const response = await request(app).get("/orders/export/sell-snapshots/data");

      expect(response.status).toBe(200);
    });
  });
});
