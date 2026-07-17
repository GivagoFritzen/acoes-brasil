import { MergeableItem } from '../models/MergeableItemModel';

export function normalizeOrderCodigo(rawCodigo: string): string {
  return String(rawCodigo ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function isCodigoFormatoValido(rawCodigo: string): boolean {
  const codigo = normalizeOrderCodigo(rawCodigo);

  if (!codigo || codigo.length > 7) {
    return false;
  }
  return /^[A-Z]{4}\d{1,2}F?$/.test(codigo);
}

export function removerSufixoF(codigo: string): string {
  const normalized = normalizeOrderCodigo(codigo);
  if (!normalized || !normalized.endsWith("F") || normalized.length <= 4) {
    return normalized;
  }
  const semF = normalized.slice(0, -1);
  return isCodigoFormatoValido(semF) ? semF : normalized;
}

export function mesclarPorCodigo<T extends MergeableItem>(items: T[]): T[] {
  const grupos = new Map<string, T[]>();

  for (const item of items) {
    const chave = removerSufixoF(item.codigo);
    if (!grupos.has(chave)) {
      grupos.set(chave, []);
    }
    grupos.get(chave)!.push(item);
  }

  return Array.from(grupos.entries()).map(([codigo, grupo]) => {
    if (grupo.length === 1) {
      return { ...grupo[0], codigo };
    }

    const totalQtd = grupo.reduce((s, i) => s + i.quantidade, 0);
    const precoMedio = totalQtd > 0
      ? grupo.reduce((s, i) => s + i.quantidade * i.precoMedio, 0) / totalQtd
      : 0;

    return { ...grupo[0], codigo, quantidade: totalQtd, precoMedio };
  });
}