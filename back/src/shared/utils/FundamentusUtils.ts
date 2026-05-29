export function normalizeCodigoForFundamentus(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (/^[A-Z0-9]{6}$/.test(normalized) && normalized.endsWith("F")) {
    return normalized.slice(0, -1);
  }
  return normalized;
}

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_match: string, code: string) => String.fromCharCode(Number(code)));
}

export function stripHtml(value: string): string {
  const text = decodeHtmlEntities(value);
  const result: string[] = [];
  let inTag = false;
  for (const ch of text) {
    if (ch === "<") { inTag = true; }
    else if (ch === ">") { inTag = false; }
    else if (!inTag) { result.push(ch); }
  }
  return result.join("").replace(/\s+/g, " ").trim();
}
