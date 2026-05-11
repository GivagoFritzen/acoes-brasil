import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    name: process.env.DB_NAME ?? "AppDb",
    user: process.env.DB_USER ?? "sa",
    password: process.env.DB_PASSWORD ?? "",
    dialect: (process.env.DB_DIALECT ?? "mssql") as "mssql" | "mysql" | "sqlite",
    storage: process.env.DB_STORAGE,
  },
};