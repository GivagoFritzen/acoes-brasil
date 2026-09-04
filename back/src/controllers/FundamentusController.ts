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
      { translationKey: "scraping.fundamentusFailed", httpStatus: 404 },
      { translationKey: "scraping.fundamentusNoData", httpStatus: 502 },
    ]);
  }

  async getProventosAsync(req: Request, res: Response): Promise<Response> {
    return this.executeAsync(req, res, (codigo) => this.fundamentusProventosScraper.scrapeAsync(codigo), [
      { translationKey: "scraping.fundamentusFailed", httpStatus: 502 },
    ]);
  }
}
