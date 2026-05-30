import { Router } from "express";
import { PortfolioController } from "../controllers/PortfolioController";

export const portfolioRoutes = Router();

portfolioRoutes.post("/", (req, res) => {
  const controller = new PortfolioController();
  return controller.createOrUpdateAsync(req, res);
});

portfolioRoutes.get("/", (req, res) => {
  const controller = new PortfolioController();
  return controller.listAsync(req, res);
});

portfolioRoutes.delete("/:id", (req, res) => {
  const controller = new PortfolioController();
  return controller.deleteAsync(req, res);
});
