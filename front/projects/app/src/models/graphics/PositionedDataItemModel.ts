import type { ProfitLossDataItem } from './ProfitLossDataItemModel';

export interface PositionedDataItem extends ProfitLossDataItem {
    index: number;
}