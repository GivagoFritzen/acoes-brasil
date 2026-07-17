import { Router } from "express";
import { Investidor10Controller } from "../controllers/Investidor10Controller";

export const investidor10Routes = Router();
const getInvestidor10Controller = () => new Investidor10Controller();

investidor10Routes.get("/:codigo", (req, res) => {
  return getInvestidor10Controller().getAsync(req, res);
});

investidor10Routes.get("/:codigo/proventos", (req, res) => {
  return getInvestidor10Controller().getProventosAsync(req, res);
});
