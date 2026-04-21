import { Optional } from "sequelize";
import { PortfolioAttributes } from "./PortfolioAttributes";

export type PortfolioCreationAttributes = Optional<
    PortfolioAttributes,
    "id" | "createdAt" | "updatedAt"
>;
