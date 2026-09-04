import { SellDivergence } from "./SellDivergence";

export interface DeleteOrderValidationResult {
  hasDivergence: boolean;
  divergences: SellDivergence[];
}
