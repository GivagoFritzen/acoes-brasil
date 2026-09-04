import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "./ErrorHandler";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  return ErrorHandler.handle(err, res);
}
