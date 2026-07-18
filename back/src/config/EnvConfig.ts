import dotenv from "dotenv";

dotenv.config();

const PORTA_PADRAO = 3000;
const PORTA_DB_PADRAO = 1433;

export const env = {
  port: Number(process.env.PORT ?? PORTA_PADRAO),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? PORTA_DB_PADRAO),
    name: process.env.DB_NAME ?? "AppDb",
    user: process.env.DB_USER ?? "sa",
    password: process.env.DB_PASSWORD ?? "",
    dialect: (process.env.DB_DIALECT ?? "sqlite") as "mssql" | "mysql" | "sqlite",
    storage: process.env.DB_STORAGE,
  },
};