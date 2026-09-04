import { Response } from "express";
import { AppException } from "../exceptions/AppException";
import { logger } from "../logger/Logger";
import { translationService } from "../i18n/TranslationService";

const SEQUELIZE_VALIDATION_ERRORS = [
  "SequelizeValidationError",
  "SequelizeUniqueConstraintError",
  "SequelizeForeignKeyConstraintError",
  "SequelizeConstraintError",
];

export class ErrorHandler {
  static handle(error: Error, res: Response, lang?: string): Response {
    logger.error("Erro na requisição", { error: error.message });

    if (error instanceof AppException) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    if (SEQUELIZE_VALIDATION_ERRORS.includes(error.name)) {
      return res.status(400).json({ message: error.message });
    }

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({ message: translationService.translate('error.database', lang) });
    }

    return res.status(500).json({ message: translationService.translate('error.internal', lang) });
  }
}
