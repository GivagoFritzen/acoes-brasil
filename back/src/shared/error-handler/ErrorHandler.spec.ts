import { Response } from "express";
import { ErrorHandler } from "./ErrorHandler";
import { ValidationError } from "../exceptions/ValidationError";
import { NotFoundException } from "../exceptions/NotFoundException";
import { BusinessException } from "../exceptions/BusinessException";
import { ValidationException } from "../exceptions/ValidationException";

function createMockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("ErrorHandler", () => {
  let res: Partial<Response>;

  beforeEach(() => {
    res = createMockRes();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Deve retornar 400 quando erro for ValidationError", () => {
    const error = new ValidationError("Dados inválidos");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Dados inválidos" });
  });

  it("Deve retornar 404 quando erro for NotFoundException", () => {
    const error = new NotFoundException("Ordem não encontrada.");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Ordem não encontrada." });
  });

  it("Deve retornar 400 quando erro for BusinessException", () => {
    const error = new BusinessException("A remoção da ordem deixaria o portfolio inconsistente.");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "A remoção da ordem deixaria o portfolio inconsistente." });
  });

  it("Deve retornar 400 quando erro for ValidationException", () => {
    const error = new ValidationException("Dados inválidos para criar order.");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Dados inválidos para criar order." });
  });

  it("Deve retornar 500 quando erro generico sem heranca de AppException", () => {
    const error = new Error("Erro qualquer");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
      error: "Erro qualquer",
    });
  });

  it("Deve retornar 500 quando erro nao for mapeado", () => {
    const error = new Error("erro desconhecido");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
      error: "erro desconhecido",
    });
  });
});
