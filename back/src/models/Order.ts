import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";
import { OrderCreationAttributes } from "./OrderCreationAttributes";
import { OrderAttributes } from "./OrderAttributes";

export type OrderOperacao = "Compra" | "Venda";
export type OrderTipo = "FII" | "BDR" | "ACAO";

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: string;
  declare codigo: string;
  declare valor: number;
  declare quantidade: number;
  declare data: string;
  declare tipo: OrderTipo;
  declare operacao: OrderOperacao;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

const normalizeToBrDate = (value: string): string => {
  const brDatePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

  if (brDatePattern.test(value)) {
    return value;
  }

  const isoMatch = value.match(isoDatePattern);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}-${month}-${year}`;
  }

  return value;
};

const getCurrentBrDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

Order.init(
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
    valor: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: getCurrentBrDate,
      set(value: string) {
        this.setDataValue("data", normalizeToBrDate(value));
      },
      validate: {
        is: /^\d{2}-\d{2}-\d{4}$/,
      },
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    operacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Orders",
  }
);