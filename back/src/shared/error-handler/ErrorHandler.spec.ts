import { Response } from "express";
import { ErrorHandler } from "./ErrorHandler";
import { ValidationError } from "../validators/OrderValidator";

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

  it("Deve retornar 404 quando mensagem conter Ordem nao encontrada", () => {
    const error = new Error("Ordem não encontrada");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Ordem não encontrada" });
  });

  it("Deve retornar 404 quando mensagem conter Ativo do portfolio nao encontrado", () => {
    const error = new Error("Ativo do portfólio não encontrado");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("Deve retornar 404 quando mensagem conter provento nao encontrado", () => {
    const error = new Error("provento não encontrado");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("Deve retornar 400 quando mensagem conter invalidos para criar order", () => {
    const error = new Error("Dados inválidos para criar order");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("Deve retornar 400 quando mensagem conter futura", () => {
    const error = new Error("data futura");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("Deve retornar 400 quando mensagem conter Operacao invalida", () => {
    const error = new Error("Operação inválida");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("Deve retornar 400 quando mensagem conter Nao e possivel vender", () => {
    const error = new Error("Não é possível vender");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("Deve retornar 400 quando mensagem conter inconsistente", () => {
    const error = new Error("dados inconsistentes");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("Deve retornar 500 quando erro generico sem mensagem especifica", () => {
    const error = new Error("Erro qualquer");

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
      error: "Erro qualquer",
    });
  });

  it("Deve retornar 500 quando erro nao for instancia de Error", () => {
    const error = "string error";

    ErrorHandler.handle(error, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
      error: "string error",
    });
  });
});
