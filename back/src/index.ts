import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { sequelize } from "./database";
import { fundamentusRoutes } from "./routes/fundamentusRoutes";
import { orderRoutes } from "./routes/orderRoutes";
import { portfolioRoutes } from "./routes/portfolioRoutes";
import { proventoRoutes } from "./routes/proventoRoutes";
import { registerServices } from "./shared/dependency-injection/service-registration";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/orders", orderRoutes);
app.use("/portfolios", portfolioRoutes);
app.use("/proventos", proventoRoutes);
app.use("/fundamentus", fundamentusRoutes);

async function start() {
  try {
    registerServices();
    await sequelize.authenticate();

    if (env.db.dialect === "sqlite") {
      await sequelize.sync();
    }

    console.log("Conectado ao banco com sucesso");

    app.listen(env.port, () => {
      console.log(`Servidor rodando na porta ${env.port}`);
    });
  } catch (error) {
    console.error("Falha ao conectar no banco", error);
    process.exit(1);
  }
}

start();