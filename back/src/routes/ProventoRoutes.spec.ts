import request from "supertest";
import express from "express";
import { proventoRoutes } from "./ProventoRoutes";
import { ProventoController } from "../controllers/ProventoController";

const mockCreateService = { executeAsync: jest.fn().mockResolvedValue({ id: "1" }) };
const mockDeleteService = { executeAsync: jest.fn().mockResolvedValue({}) };
const mockImportService = { executeAsync: jest.fn().mockResolvedValue({ imported: 5 }) };
const mockListService = { executeAsync: jest.fn().mockResolvedValue([]) };
const mockParser = {
  parseProventoRowsAsync: jest.fn().mockReturnValue({
    validRows: [{ codigo: "VALE3" }],
    invalidLineNumbers: [],
  }),
};

jest.mock("../../shared/dependency-injection/Container", () => ({
  Container: {
    get: jest.fn((name: string) => {
      if (name === "ProventoController") {
        return new ProventoController(
          mockCreateService as any,
          mockDeleteService as any,
          mockImportService as any,
          mockListService as any,
          mockParser as any
        );
      }
      return {};
    }),
  },
}));

describe("proventoRoutes", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/proventos", proventoRoutes);
  });

  describe("POST /", () => {
    it("Deve responder com status 201 ao criar provento", async () => {
      const response = await request(app)
        .post("/proventos")
        .send({
          codigo: "VALE3",
          data: "2024-01-01",
          tipo: "DIVIDENDO",
          instituicao: "B3",
          quantidade: 100,
          precoUnitario: 1.50,
          valorLiquido: 150.0,
        });

      expect(response.status).toBe(201);
    });
  });

  describe("POST /import", () => {
    it("Deve responder com status 201 ao importar arquivo", async () => {
      const response = await request(app)
        .post("/proventos/import")
        .attach("file", Buffer.from("test"), "test.xlsx");

      expect(response.status).toBe(201);
    });
  });

  describe("DELETE /:id", () => {
    it("Deve responder com status 200 ao deletar provento", async () => {
      const response = await request(app).delete("/proventos/550e8400-e29b-41d4-a716-446655440000");

      expect(response.status).toBe(200);
    });
  });

  describe("GET /", () => {
    it("Deve responder com status 200 ao listar proventos", async () => {
      const response = await request(app).get("/proventos");

      expect(response.status).toBe(200);
    });

    it("Deve aceitar parametros de filtro", async () => {
      const response = await request(app)
        .get("/proventos")
        .query({ codigo: "VALE3", tipo: "DIVIDENDO" });

      expect(response.status).toBe(200);
    });
  });
});
