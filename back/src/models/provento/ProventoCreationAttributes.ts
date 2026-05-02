import { Optional } from "sequelize";
import { ProventoAttributes } from "./ProventoAttributes";

export type ProventoCreationAttributes = Optional<ProventoAttributes, "id" | "createdAt" | "updatedAt">;
