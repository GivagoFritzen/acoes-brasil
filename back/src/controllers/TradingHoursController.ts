import { Request, Response } from "express";
import { TradingHoursScraperService } from "../infrastructure/services/TradingHoursScraperService";

export class TradingHoursController {
  private scraperService: TradingHoursScraperService;

  constructor() {
    this.scraperService = new TradingHoursScraperService();
  }

  async getAsync(_req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.scraperService.scrapeAsync();

      return res.json({
        success: true,
        data: {
          id: "bvmf",
          name: "B3",
          shortName: "B3",
          country: "BR",
          region: "BR",
          timezone: data.timezone,
          currency: "BRL",
          marketCap: "",
          location: "São Paulo",
          website: "https://www.b3.com.br",
          openTime: data.openTime,
          closeTime: data.closeTime,
          isOpen: data.isOpen,
          holidays: [],
          tradingDays: data.tradingDays,
          nextOpenTime: "",
          currentStatus: {
            marketId: "bvmf",
            isOpen: data.isOpen,
            status: data.isOpen ? "open" : "closed",
            nextChange: "",
            localTime: "",
            marketTime: "",
          },
          upcomingHolidays: [],
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter status do mercado",
      });
    }
  }
}
