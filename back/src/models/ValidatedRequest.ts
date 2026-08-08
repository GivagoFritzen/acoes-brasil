import { Request } from "express";

export interface ValidatedRequest<T = Record<string, unknown>> extends Request {
  validatedBody: T;
}
