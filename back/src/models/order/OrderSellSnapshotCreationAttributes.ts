import { Optional } from "sequelize";
import type { OrderSellSnapshotAttributes } from "./OrderSellSnapshotAttributes";

export type OrderSellSnapshotCreationAttributes = Optional<
  OrderSellSnapshotAttributes,
  "id" | "createdAt" | "updatedAt"
>;
