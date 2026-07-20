import { Request, Response } from "express";
import { FundamentusScraperService } from "../infrastructure/services/FundamentusScraperService";
import { FundamentusProventosScraperService } from "../infrastructure/services/FundamentusProventosScraperService";
import { Container } from "../shared/dependency-injection/Container";
import { BaseScrapingController } from "./base/BaseScrapingController";

export class FundamentusController extends BaseScrapingController {
  private fundamentusScraper: FundamentusScraperService;
  private fundamentusProventosScraper: FundamentusProventosScraperService;

  constructor() {
    super();
    this.fundamentusScraper = Container.get("fundamentusScraper");
    this.fundamentusProventosScraper = Container.get("fundamentusProventosScraper");
  }

  async getAsync(req: Request, res: Response): Promise<Response> {
    return this.executeAsync(req, res, (codigo) => this.fundamentusScraper.scrapeAsync(codigo), [
      { match: "não encontrado no Fundamentus", httpStatus: 404 },
      { match: "Falha ao consultar Fundamentus", httpStatus: 502 },
      { match: "Não foi possível extrair dados", httpStatus: 502 },
    ]);
  }

  async getProventosAsync(req: Request, res: Response): Promise<Response> {
    return this.executeAsync(req, res, (codigo) => this.fundamentusProventosScraper.scrapeAsync(codigo), [
      { match: "Falha ao consultar Fundamentus", httpStatus: 502 },
    ]);
  }
}
