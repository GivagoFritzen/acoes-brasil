import { SellDivergence } from "./SellDivergence";

export interface SellValidationResult {
  hasDivergence: boolean;
  divergence?: SellDivergence;
}
