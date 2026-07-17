import { Router } from "express";
import { FundamentusController } from "../controllers/FundamentusController";

export const fundamentusRoutes = Router();
const getFundamentusController = () => new FundamentusController();

fundamentusRoutes.get("/:codigo", (req, res) => {
  return getFundamentusController().getAsync(req, res);
});

fundamentusRoutes.get("/:codigo/proventos", (req, res) => {
  return getFundamentusController().getProventosAsync(req, res);
});
