import { Request, Response } from "express";
import { YahooFinanceScraperService } from "../infrastructure/services/YahooFinanceScraperService";
import { Container } from "../shared/dependency-injection/Container";
import { BaseScrapingController } from "./base/BaseScrapingController";

export class YahooFinanceController extends BaseScrapingController {
  private yahooFinanceScraper: YahooFinanceScraperService;

  constructor() {
    super();
    this.yahooFinanceScraper = Container.get("yahooFinanceScraper");
  }

  async getAsync(req: Request, res: Response): Promise<Response> {
    return this.executeAsync(req, res, (codigo) => this.yahooFinanceScraper.scrapeAsync(codigo), [
      { match: "Falha ao consultar Yahoo Finance", httpStatus: 502 },
      { match: "Não foi possível extrair dados", httpStatus: 502 },
      { match: "Falha ao autenticar", httpStatus: 502 },
    ]);
  }
}
