import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";
import {
  OrderSellSnapshotAttributes,
  OrderSellSnapshotCreationAttributes,
} from "./OrderSellSnapshotAttributes";

export class OrderSellSnapshot
  extends Model<OrderSellSnapshotAttributes, OrderSellSnapshotCreationAttributes>
  implements OrderSellSnapshotAttributes
{
  declare id: string;
  declare orderId: string;
  declare codigo: string;
  declare precoMedioAtual: number;
  declare quantidade: number;
  declare valorAtualAcao: number;
  declare ganhos: number;
  declare teveLucro: boolean;
  declare data: string;
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

OrderSellSnapshot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precoMedioAtual: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    valorAtualAcao: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ganhos: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    teveLucro: {
      type: DataTypes.BOOLEAN,
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
  },
  {
    sequelize,
    tableName: "OrderSellSnapshots",
  }
);
