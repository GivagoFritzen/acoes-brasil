import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";

export interface CreateOrUpdatePortfolioResult {
  portfolio: PortfolioEntity;
  created: boolean;
}
