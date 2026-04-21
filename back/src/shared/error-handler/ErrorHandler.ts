import { Request, Response } from "express";
import { ValidationError } from "../validators/OrderValidator";

export class ErrorHandler {
  static handle(error: unknown, req: Request, res: Response): Response {
    console.error('Error occurred:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes("Ordem não encontrada")) {
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

    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
