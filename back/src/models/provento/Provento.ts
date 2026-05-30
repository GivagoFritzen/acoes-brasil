import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";
import { ProventoAttributes } from "./ProventoAttributes";
import type { ProventoTipo as proventoTipo } from "../../../../common/models/provento";
import { proventoCreationAttributes } from "./ProventoCreationAttributes";
import { DateUtils } from "../../shared/utils/DateUtils";

export class Provento extends Model<ProventoAttributes, proventoCreationAttributes>
  implements ProventoAttributes {
  declare id: string;
  declare codigo: string;
  declare data: string;
  declare tipo: proventoTipo;
  declare instituicao: string;
  declare quantidade: number;
  declare precoUnitario: number;
  declare valorLiquido: number;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

const normalizeToBrDate = DateUtils.normalizeToBrDateString;
const getCurrentBrDate = DateUtils.getCurrentBrDate;

Provento.init(
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
    data: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: getCurrentBrDate,
      set(value: string) {
        this.setDataValue("data", normalizeToBrDate(value));
      },
      validate: {
        isValidBrDate(value: string) {
          if (!DateUtils.isValidBrDate(value)) {
            throw new Error("Data inválida. Use o formato DD-MM-AAAA com uma data real.");
          }
        },
      },
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    instituicao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precoUnitario: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
    },
    valorLiquido: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Proventos",
  }
);