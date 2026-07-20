import { Request, Response } from "express";
import { ErrorHandler } from "../../shared/error-handler/ErrorHandler";
import type { ErrorRule } from "../../models/ErrorRule";

export abstract class BaseScrapingController {
  protected async executeAsync<T>(
    req: Request,
    res: Response,
    scrapeFn: (codigo: string) => Promise<T>,
    errorRules: ErrorRule[] = []
  ): Promise<Response> {
    const codigo = String(req.params.codigo ?? "").trim().toUpperCase();

    if (!codigo) {
      return res.status(400).json({ message: "Código do ativo é obrigatório." });
    }

    try {
      const parsed = await scrapeFn(codigo);
      return res.json(parsed);
    } catch (error) {
      if (error instanceof Error) {
        for (const rule of errorRules) {
          if (error.message.includes(rule.match)) {
            return res.status(rule.httpStatus).json({ message: error.message });
          }
        }
      }
      return ErrorHandler.handle(error as Error, res);
    }
  }
}
