import { Optional } from "sequelize";
import { OrderAttributes } from "./OrderAttributes";

export type OrderCreationAttributes = Optional<OrderAttributes, "id" | "createdAt" | "updatedAt">;
