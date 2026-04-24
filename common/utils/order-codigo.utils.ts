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