import { Optional } from "sequelize";
import { OrderAttributes } from "./OrderAttributes";

export type orderCreationAttributes = Optional<OrderAttributes, "id" | "createdAt" | "updatedAt">;
