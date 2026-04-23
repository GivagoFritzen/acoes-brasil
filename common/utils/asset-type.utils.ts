import { normalizeOrderCodigo } from './order-codigo.utils';

export type DetectedAssetType = 'ACAO' | 'FII' | 'BDR' | 'UNKNOWN';
export type SupportedAssetType = Exclude<DetectedAssetType, 'UNKNOWN'>;

const ACAO_REGEX = /^[A-Z]{4}(3|4)$/;
const FII_REGEX = /^[A-Z]{4}11$/;
const BDR_REGEX = /^[A-Z]{4}(31|32|33|34|35|39)$/;

export function detectAssetTypeFromTicker(rawTicker: string): DetectedAssetType {
  const ticker = normalizeOrderCodigo(rawTicker);

  if (!ticker) {
    return 'UNKNOWN';
  }

  if (BDR_REGEX.test(ticker)) {
    return 'BDR';
  }

  if (FII_REGEX.test(ticker)) {
    return 'FII';
  }

  if (ACAO_REGEX.test(ticker)) {
    return 'ACAO';
  }

  return 'UNKNOWN';
}

export function isSupportedB3Ticker(rawTicker: string): boolean {
  return detectAssetTypeFromTicker(rawTicker) !== 'UNKNOWN';
}

export function detectSupportedAssetTypeFromTicker(rawTicker: string): SupportedAssetType | null {
  const detected = detectAssetTypeFromTicker(rawTicker);
  return detected === 'UNKNOWN' ? null : detected;
}
