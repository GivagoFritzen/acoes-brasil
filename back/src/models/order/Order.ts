import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";
import { orderCreationAttributes } from "./OrderCreationAttributes";
import { OrderAttributes } from "./OrderAttributes";
import { DateUtils } from "../../shared/utils/DateUtils";
import type { OrderOperacao as orderOperacao, OrderTipo as orderTipo } from "../../../../common/models/order";

export class Order extends Model<OrderAttributes, orderCreationAttributes> implements OrderAttributes {
  declare id: string;
  declare codigo: string;
  declare valor: number;
  declare quantidade: number;
  declare data: string;
  declare tipo: orderTipo;
  declare operacao: orderOperacao;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

const getCurrentDate = DateUtils.getCurrentDate;

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
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: getCurrentDate,
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