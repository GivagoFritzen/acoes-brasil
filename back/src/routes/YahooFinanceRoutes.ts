import { Router } from "express";
import { YahooFinanceController } from "../controllers/YahooFinanceController";

export const yahooFinanceRoutes = Router();
const getYahooFinanceController = () => new YahooFinanceController();

yahooFinanceRoutes.get("/:codigo", (req, res) => {
  return getYahooFinanceController().getAsync(req, res);
});
