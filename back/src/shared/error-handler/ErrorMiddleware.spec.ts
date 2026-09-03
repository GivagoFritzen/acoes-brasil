import { Request, Response, NextFunction } from "express";
import { errorMiddleware } from "./ErrorMiddleware";
import { ErrorHandler } from "./ErrorHandler";

jest.mock("./ErrorHandler", () => ({
  ErrorHandler: {
    handle: jest.fn(),
  },
}));

describe("ErrorMiddleware", () => {
  it("deve delegar o tratamento de erro para ErrorHandler.handle", () => {
    const error = new Error("Erro de teste");
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    errorMiddleware(error, req, res, next);

    expect(ErrorHandler.handle).toHaveBeenCalledWith(error, res);
  });
});
