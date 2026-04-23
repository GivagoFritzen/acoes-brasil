export function normalizeOrderCodigo(rawCodigo: string): string {
  return String(rawCodigo ?? "")
    .trim()
    .toUpperCase()
    .replace(/F+$/, "");
}