import { Request, Response } from "express";
import { Investidor10ScraperService } from "../infrastructure/services/Investidor10ScraperService";
import { Container } from "../shared/dependency-injection/Container";
import { BaseScrapingController } from "./base/BaseScrapingController";

export class Investidor10Controller extends BaseScrapingController {
  private investidor10Scraper: Investidor10ScraperService;

  constructor() {
    super();
    this.investidor10Scraper = Container.get("investidor10Scraper");
  }

  async getAsync(req: Request, res: Response): Promise<Response> {
    return this.executeAsync(req, res, (codigo) => this.investidor10Scraper.scrapeAsync(codigo), [
      { match: "Falha ao consultar Investidor10", httpStatus: 502 },
      { match: "Não foi possível extrair dados", httpStatus: 502 },
    ]);
  }

  async getProventosAsync(req: Request, res: Response): Promise<Response> {
    return this.executeAsync(req, res, (codigo) => this.investidor10Scraper.scrapeDividendosAsync(codigo), [
      { match: "Falha ao consultar Investidor10", httpStatus: 502 },
      { match: "Não foi possível extrair dados", httpStatus: 502 },
    ]);
  }
}
