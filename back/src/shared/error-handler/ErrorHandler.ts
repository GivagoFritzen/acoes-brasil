import { Request, Response } from "express";
import { ValidationError } from "../validators/OrderValidator";
import { logger } from "../logger/Logger";

const SEQUELIZE_ERROR_NAMES = [
  "SequelizeValidationError",
  "SequelizeUniqueConstraintError",
  "SequelizeForeignKeyConstraintError",
  "SequelizeDatabaseError",
  "SequelizeConstraintError",
];

export class ErrorHandler {
  static handle(error: unknown, req: Request, res: Response): Response {
    logger.error("Erro na requisição", { error: error instanceof Error ? error.message : String(error) });

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof Error && SEQUELIZE_ERROR_NAMES.includes(error.name)) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("Ordem não encontrada") ||
          message.includes("Ativo do portfólio não encontrado") ||
          message.includes("provento não encontrado")) {
        return res.status(404).json({ message });
      }
      
      if (message.includes("inválidos para criar order") || 
          message.includes("futura") || 
          message.includes("Operação inválida") ||
          message.includes("Não é possível vender") ||
          message.includes("inconsistente")) {
        return res.status(400).json({ message });
      }
    }

    const errMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: errMsg
    });
  }
}
