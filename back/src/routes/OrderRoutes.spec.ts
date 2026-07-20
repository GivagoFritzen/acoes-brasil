import request from "supertest";
import express from "express";
import { orderRoutes } from "./OrderRoutes";
import { OrderController } from "../controllers/OrderController";
import { ImportController } from "../controllers/ImportController";

const mockCreateService = { executeAsync: jest.fn().mockResolvedValue({ id: "1" }) };
const mockDeleteService = { executeAsync: jest.fn().mockResolvedValue({}) };
const mockListService = { executeAsync: jest.fn().mockResolvedValue({ items: [], total: 0 }) };
const mockGetSellSnapshotsService = { executeAsync: jest.fn().mockResolvedValue([]) };
const mockExportSellSnapshotsService = { executeAsync: jest.fn().mockResolvedValue({ buffer: Buffer.from("test"), fileName: "test.xlsx" }) };
const mockImportOrdersService = { executeAsync: jest.fn().mockResolvedValue(5) };
const mockParser = { parseOrderRowsAsync: jest.fn().mockReturnValue([{ codigo: "VALE3" }]) };

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "OrderController") {
        return new OrderController(
          mockCreateService as any,
          mockDeleteService as any,
          mockListService as any,
          mockGetSellSnapshotsService as any,
          mockExportSellSnapshotsService as any
        );
      }
      if (name === "ImportController") {
        return new ImportController(mockImportOrdersService as any, mockParser as any);
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
        .attach("file", Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]), "test.xlsx");

      expect(response.status).toBe(201);
    });
  });

  describe("DELETE /:id", () => {
    it("Deve responder com status 200 ao deletar ordem", async () => {
      const response = await request(app).delete("/orders/550e8400-e29b-41d4-a716-446655440000");

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
