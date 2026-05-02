import { Optional } from "sequelize";

export interface OrderSellSnapshotAttributes {
  id: string;
  orderId: string;
  codigo: string;
  precoMedioAtual: number;
  quantidade: number;
  valorAtualAcao: number;
  ganhos: number;
  teveLucro: boolean;
  data: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderSellSnapshotCreationAttributes = Optional<
  OrderSellSnapshotAttributes,
  "id" | "createdAt" | "updatedAt"
>;
