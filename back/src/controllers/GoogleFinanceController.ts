import { Request, Response } from "express";
import { GoogleFinanceService } from "../infrastructure/services/GoogleFinanceService";
import { Container } from "../shared/dependency-injection/Container";

export class GoogleFinanceController {
  private googleFinanceService: GoogleFinanceService;

  constructor() {
    this.googleFinanceService = Container.get("googleFinanceService");
  }

  async getAsync(req: Request, res: Response): Promise<Response> {
    const codigo = String(req.params.codigo ?? "").trim().toUpperCase();
    const chartWindow = String(req.query.window ?? "1Y").trim().toUpperCase();

    if (!codigo) {
      return res.status(400).json({ message: "Código do ativo é obrigatório." });
    }

    try {
      const data = await this.googleFinanceService.getDataAsync(codigo, chartWindow);
      return res.json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return res.json({
        quote: null,
        chart: null,
        updatedAt: new Date().toISOString(),
        error: message,
      });
    }
  }
}
