import { Router } from "express";
import { Portfolio } from "../models/Portfolio";

export const portfolioRoutes = Router();

const normalizeCodigo = (value: unknown): string => {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (/^[A-Z0-9]{6}$/.test(normalized) && normalized.endsWith("F")) {
    return normalized.slice(0, -1);
  }

  return normalized;
};
const normalizeNome = (value: unknown): string => String(value ?? "").trim();

portfolioRoutes.post("/", async (req, res) => {
  try {
    const codigo = normalizeCodigo(req.body?.codigo);
    const nome = normalizeNome(req.body?.nome);
    const quantidade = Number(req.body?.quantidade);
    const precoMedio = Number(req.body?.precoMedio);

    if (!codigo || !nome || !Number.isFinite(quantidade) || quantidade <= 0 || !Number.isFinite(precoMedio) || precoMedio < 0) {
      return res.status(400).json({ message: "Dados inválidos para criar/atualizar portfolio." });
    }

    const existingPortfolios = await Portfolio.findAll();
    const existingPortfolio = existingPortfolios.find(
      (item) => normalizeCodigo(item.codigo) === codigo
    );

    if (existingPortfolio) {
      const quantidadeAtual = Number(existingPortfolio.quantidade ?? 0);
      const precoMedioAtual = Number(existingPortfolio.precoMedio ?? 0);

      const novaQuantidade = quantidadeAtual + quantidade;
      const custoTotalAtual = quantidadeAtual * precoMedioAtual;
      const custoTotalNovoLote = quantidade * precoMedio;
      const novoPrecoMedio = novaQuantidade > 0
        ? (custoTotalAtual + custoTotalNovoLote) / novaQuantidade
        : 0;

      existingPortfolio.codigo = codigo;
      existingPortfolio.quantidade = novaQuantidade;
      existingPortfolio.precoMedio = novoPrecoMedio;

      await existingPortfolio.save();
      return res.status(200).json(existingPortfolio);
    }

    const portfolio = await Portfolio.create({
      ...req.body,
      codigo,
      nome,
      quantidade,
      precoMedio,
    });

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