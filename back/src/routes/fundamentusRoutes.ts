import { Router } from "express";
import { FundamentusController } from "../controllers/FundamentusController";

export const fundamentusRoutes = Router();

fundamentusRoutes.get("/:codigo", (req, res) => {
  new FundamentusController().getAsync(req, res);
});
