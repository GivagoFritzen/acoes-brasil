import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";
import { ProventoAttributes } from "./ProventoAttributes";
import { ProventoCreationAttributes } from "./ProventoCreationAttributes";
import { ProventoTipo } from "./ProventoTipo";

export class Provento extends Model<ProventoAttributes, ProventoCreationAttributes>
  implements ProventoAttributes {
  declare id: string;
  declare codigo: string;
  declare data: string;
  declare tipo: ProventoTipo;
  declare instituicao: string;
  declare quantidade: number;
  declare precoUnitario: number;
  declare valorLiquido: number;
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
        is: /^\d{2}-\d{2}-\d{4}$/,
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
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    valorLiquido: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Proventos",
  }
);