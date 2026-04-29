import { Request, Response } from "express";
import { FundamentusScraperService } from "../infrastructure/services/FundamentusScraperService";
import { Container } from "../shared/dependency-injection/Container";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";

export class FundamentusController {
  private fundamentusScraper: FundamentusScraperService;

  constructor() {
    this.fundamentusScraper = Container.get("fundamentusScraper");
  }

  async getAsync(req: Request, res: Response): Promise<Response> {
    const codigo = String(req.params.codigo ?? "").trim().toUpperCase();

    if (!codigo) {
      return res.status(400).json({ message: "Código do ativo é obrigatório." });
    }

    try {
      const parsed = await this.fundamentusScraper.scrapeAsync(codigo);
      return res.json(parsed);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("não encontrado no Fundamentus")) {
          return res.status(404).json({ message: error.message });
        }
        if (
          error.message.includes("Falha ao consultar Fundamentus") ||
          error.message.includes("Não foi possível extrair dados")
        ) {
          return res.status(502).json({ message: error.message });
        }
      }
      return ErrorHandler.handle(error, req, res);
    }
  }
}
