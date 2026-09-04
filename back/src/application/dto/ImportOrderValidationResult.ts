import { ImportOrderDivergence } from "./ImportOrderDivergence";

export interface ImportOrderValidationResult {
  hasDivergences: boolean;
  divergences: ImportOrderDivergence[];
}
