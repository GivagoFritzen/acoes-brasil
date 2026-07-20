import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";
import { OrderSellSnapshotAttributes } from "./OrderSellSnapshotAttributes";
import { OrderSellSnapshotCreationAttributes } from "./OrderSellSnapshotCreationAttributes";
import { DateUtils } from "../../shared/utils/DateUtils";

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

const getCurrentDate = DateUtils.getCurrentDate;

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
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: getCurrentDate,
    },
  },
  {
    sequelize,
    tableName: "OrderSellSnapshots",
  }
);
