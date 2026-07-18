import { Request, Response, NextFunction } from "express";
import { AppException } from "../shared/exceptions/AppException";
import { isValidUuid } from "../shared/validators/IdValidator";

export type ValidationSchema = (body: any) => Record<string, any>;

export class ValidationMiddleware {
  static validate(schema: ValidationSchema): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
      try {
        const validated = schema(req.body);
        (req as any).validatedBody = validated;
        next();
      } catch (error) {
        const status = error instanceof AppException ? error.statusCode : 400;
        return res.status(status).json({ message: (error as Error).message });
      }
    };
  }

  static validateUuidParam(paramName: string = "id"): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
      const value = req.params[paramName];
      if (!isValidUuid(String(value))) {
        return res.status(400).json({ message: "ID inválido." });
      }
      next();
    };
  }
}
