import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";
import { PortfolioAttributes } from "./PortfolioAttributes";
import { PortfolioCreationAttributes } from "./PortfolioCreationAttributes";

export class Portfolio
  extends Model<PortfolioAttributes, PortfolioCreationAttributes>
  implements PortfolioAttributes {
  declare id: string;
  declare codigo: string;
  declare quantidade: number;
  declare precoMedio: number;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

Portfolio.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precoMedio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Portfolios",
  }
);