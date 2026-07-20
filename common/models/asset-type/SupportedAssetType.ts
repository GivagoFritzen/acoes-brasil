import type { DetectedAssetType } from './DetectedAssetType';

export type SupportedAssetType = Exclude<DetectedAssetType, 'UNKNOWN'>;
