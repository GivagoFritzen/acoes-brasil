import { Router } from "express";
import { GoogleFinanceController } from "../controllers/GoogleFinanceController";

export const googleFinanceRoutes = Router();
const getGoogleFinanceController = () => new GoogleFinanceController();

googleFinanceRoutes.get("/:codigo", (req, res) => {
  return getGoogleFinanceController().getAsync(req, res);
});
