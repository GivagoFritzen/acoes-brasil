import { Router } from "express";
import { TradingHoursController } from "../controllers/TradingHoursController";

export const tradingHoursRoutes = Router();
const getController = () => new TradingHoursController();

tradingHoursRoutes.get("/", (req, res) => {
  return getController().getAsync(req, res);
});
