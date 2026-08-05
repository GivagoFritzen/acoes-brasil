import { ValidationMiddleware, ValidationSchema } from "./ValidationMiddleware";
import { AppException } from "../shared/exceptions/AppException";
import { Request, Response, NextFunction } from "express";

describe("ValidationMiddleware", () => {
  function createMockReq(body: object = {}, params: object = {}): Request {
    return { body, params } as Request;
  }

  function createMockRes(): Response {
    const res = {} as Response;
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
  }

  describe("validate", () => {
    it("Deve chamar next quando schema retornar dados validos", () => {
      const schema: ValidationSchema = (body) => ({ ...body, validado: true });
      const next = jest.fn();
      const req = createMockReq({ nome: "teste" });
      const res = createMockRes();

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).validatedBody).toEqual({ nome: "teste", validado: true });
    });

    it("Deve retornar 400 quando schema lancar erro generico", () => {
      const schema: ValidationSchema = () => { throw new Error("campo obrigatório"); };
      const next = jest.fn();
      const req = createMockReq({});
      const res = createMockRes();

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "campo obrigatório" });
    });

    it("Deve retornar status do AppException quando schema lancar AppException", () => {
      class TestException extends AppException {
        constructor(msg: string) { super(msg, 422); }
      }
      const schema: ValidationSchema = () => { throw new TestException("dados inválidos"); };
      const next = jest.fn();
      const req = createMockReq({});
      const res = createMockRes();

      const middleware = ValidationMiddleware.validate(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({ message: "dados inválidos" });
    });
  });

  describe("validateUuidParam", () => {
    it("Deve chamar next quando UUID é válido", () => {
      const next = jest.fn();
      const req = createMockReq({}, { id: "550e8400-e29b-41d4-a716-446655440000" });
      const res = createMockRes();

      const middleware = ValidationMiddleware.validateUuidParam("id");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Deve retornar 400 quando UUID é inválido", () => {
      const next = jest.fn();
      const req = createMockReq({}, { id: "uuid-invalido" });
      const res = createMockRes();

      const middleware = ValidationMiddleware.validateUuidParam("id");
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "ID inválido." });
    });

    it("Deve retornar 400 quando parâmetro não existe", () => {
      const next = jest.fn();
      const req = createMockReq({}, {});
      const res = createMockRes();

      const middleware = ValidationMiddleware.validateUuidParam("id");
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("Deve aceitar nome de parâmetro customizado", () => {
      const next = jest.fn();
      const req = createMockReq({}, { userId: "550e8400-e29b-41d4-a716-446655440000" });
      const res = createMockRes();

      const middleware = ValidationMiddleware.validateUuidParam("userId");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Deve retornar 400 com parâmetro customizado quando UUID inválido", () => {
      const next = jest.fn();
      const req = createMockReq({}, { userId: "invalid" });
      const res = createMockRes();

      const middleware = ValidationMiddleware.validateUuidParam("userId");
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("Deve aceitar UUID com letras maiúsculas", () => {
      const next = jest.fn();
      const req = createMockReq({}, { id: "550E8400-E29B-41D4-A716-446655440000" });
      const res = createMockRes();

      const middleware = ValidationMiddleware.validateUuidParam("id");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("Deve usar param 'id' por padrão quando nenhum nome informado", () => {
      const next = jest.fn();
      const req = createMockReq({}, { id: "550e8400-e29b-41d4-a716-446655440000" });
      const res = createMockRes();

      const middleware = ValidationMiddleware.validateUuidParam();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
