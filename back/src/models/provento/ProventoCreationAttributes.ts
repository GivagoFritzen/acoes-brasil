import { Optional } from "sequelize";
import { ProventoAttributes } from "./ProventoAttributes";

export type proventoCreationAttributes = Optional<ProventoAttributes, "id" | "createdAt" | "updatedAt">;
