import path from "path";
import cors from "cors";
import express from "express";
import { env } from "./config/EnvConfig";
import { sequelize } from "./database";
import { fundamentusRoutes } from "./routes/FundamentusRoutes";
import { googleFinanceRoutes } from "./routes/GoogleFinanceRoutes";
import { orderRoutes } from "./routes/OrderRoutes";
import { portfolioRoutes } from "./routes/PortfolioRoutes";
import { proventoRoutes } from "./routes/ProventoRoutes";
import { registerServices } from "./shared/dependency-injection/ServiceRegistration";
import { logger } from "./shared/logger/Logger";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
app.use(express.json());

const browserDir = path.resolve(__dirname, "../../../../front/dist/app/browser");

if (process.env.SERVE_STATIC === "true") {
  app.use(express.static(browserDir));
  logger.info(`Servindo arquivos estáticos de ${browserDir}`);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/orders", orderRoutes);
app.use("/portfolios", portfolioRoutes);
app.use("/proventos", proventoRoutes);
app.use("/fundamentus", fundamentusRoutes);
app.use("/google-finance", googleFinanceRoutes);

if (process.env.SERVE_STATIC === "true") {
  app.use((_req, res) => {
    res.sendFile(path.join(browserDir, "index.csr.html"));
  });
}

async function start() {
  try {
    registerServices();
    await sequelize.authenticate();

    if (env.db.dialect === "sqlite") {
      await sequelize.sync();
    }

    logger.info("Conectado ao banco com sucesso");

    const server = app.listen(env.port, () => {
      logger.info(`Servidor rodando na porta ${env.port}`);
    });

    return server;
  } catch (error) {
    logger.error("Falha ao conectar no banco", { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { start, app };
