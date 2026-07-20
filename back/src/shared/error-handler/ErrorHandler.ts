import { Response } from "express";
import { AppException } from "../exceptions/AppException";
import { logger } from "../logger/Logger";

const SEQUELIZE_ERROR_NAMES = [
  "SequelizeValidationError",
  "SequelizeUniqueConstraintError",
  "SequelizeForeignKeyConstraintError",
  "SequelizeDatabaseError",
  "SequelizeConstraintError",
];

export class ErrorHandler {
  static handle(error: Error, res: Response): Response {
    logger.error("Erro na requisição", { error: error.message });

    if (error instanceof AppException) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    if (SEQUELIZE_ERROR_NAMES.includes(error.name)) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message
    });
  }
}
