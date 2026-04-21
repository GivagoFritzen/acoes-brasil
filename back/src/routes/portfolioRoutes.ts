import { Router } from "express";
import { Portfolio } from "../models/Portfolio";

export const portfolioRoutes = Router();

portfolioRoutes.post("/", async (req, res) => {
  try {
    const portfolio = await Portfolio.create(req.body);
    return res.status(201).json(portfolio);
  } catch (error) {
    return res.status(400).json({
      message: "Erro ao criar portfolio",
      error: error instanceof Error ? error.message : error,
    });
  }
});

portfolioRoutes.get("/", async (_req, res) => {
  const portfolios = await Portfolio.findAll({ order: [["createdAt", "DESC"]] });
  return res.json(portfolios);
});

portfolioRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await Portfolio.findByPk(id);

    if (!portfolio) {
      return res.status(404).json({ message: "Ativo do portfólio não encontrado." });
    }

    await portfolio.destroy();
    return res.json({ message: "Ativo do portfólio deletado com sucesso." });
  } catch (error) {
    return res.status(400).json({
      message: "Erro ao deletar ativo do portfólio",
      error: error instanceof Error ? error.message : error,
    });
  }
});