import { literal } from "sequelize";
import { env } from "../config/env";

export const buildBrDateOrderExpression = (modelAlias: string) => {
  if (env.db.dialect === "sqlite") {
    return literal(
      `substr("${modelAlias}"."data", 7, 4) || '-' || substr("${modelAlias}"."data", 4, 2) || '-' || substr("${modelAlias}"."data", 1, 2)`
    );
  }

  if (env.db.dialect === "mysql") {
    return literal(`STR_TO_DATE(\`${modelAlias}\`.\`data\`, '%d-%m-%Y')`);
  }

  return literal(`TRY_CONVERT(date, [${modelAlias}].[data], 105)`);
};
