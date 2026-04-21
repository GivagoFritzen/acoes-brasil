import { Dialect, Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { env } from "../config/env";

const isSqlite = env.db.dialect === "sqlite";

const sqliteStoragePath = env.db.storage ? path.resolve(env.db.storage) : path.resolve(process.cwd(), "data", "app.sqlite");

if (isSqlite) {
  fs.mkdirSync(path.dirname(sqliteStoragePath), { recursive: true });
}

export const sequelize = isSqlite
  ? new Sequelize({
      dialect: "sqlite",
      storage: sqliteStoragePath,
      logging: false,
    })
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      dialect: env.db.dialect as Dialect,
      logging: false,
      dialectOptions:
        env.db.dialect === "mssql"
          ? {
              options: {
                encrypt: false,
                trustServerCertificate: true,
              },
            }
          : undefined,
    });