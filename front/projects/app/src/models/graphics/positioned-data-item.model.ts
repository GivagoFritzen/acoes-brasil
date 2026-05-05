import type { ProfitLossDataItem } from './profit-loss-data-item.model';

export interface PositionedDataItem extends ProfitLossDataItem {
    index: number;
}