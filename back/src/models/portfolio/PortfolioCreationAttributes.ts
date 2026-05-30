import { Optional } from "sequelize";
import { PortfolioAttributes } from "./PortfolioAttributes";

export type portfolioCreationAttributes = Optional<
    PortfolioAttributes,
    "id" | "createdAt" | "updatedAt"
>;
