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
      { translationKey: "scraping.yahooFailed", httpStatus: 502 },
      { translationKey: "scraping.yahooAuthFailed", httpStatus: 502 },
      { translationKey: "scraping.yahooStatusError", httpStatus: 502 },
    ]);
  }
}
