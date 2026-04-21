import * as XLSX from "xlsx";

export type SpreadsheetRow = Record<string, unknown>;

const normalizeHeader = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const readSpreadsheetRows = (fileBuffer: Buffer): SpreadsheetRow[] => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json<SpreadsheetRow>(workbook.Sheets[firstSheet], {
    defval: "",
    raw: false,
  });
};

export const extractField = (row: SpreadsheetRow, possibleHeaders: string[]): unknown => {
  const normalizedMap = new Map<string, unknown>();

  for (const [key, value] of Object.entries(row)) {
    normalizedMap.set(normalizeHeader(key), value);
  }

  for (const header of possibleHeaders) {
    const found = normalizedMap.get(normalizeHeader(header));
    if (found !== undefined && String(found).trim() !== "") {
      return found;
    }
  }

  return undefined;
};

export const parseDecimal = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  let normalized = value.replace(/R\$/gi, "").replace(/\s/g, "").trim();

  if (!normalized) {
    return null;
  }

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    normalized = normalized.replace(",", ".");
  }

  normalized = normalized.replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

const pad = (value: number): string => String(value).padStart(2, "0");

const fromDate = (date: Date): string => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

export const toBrDateString = (value: unknown): string | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return fromDate(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${pad(parsed.d)}-${pad(parsed.m)}-${parsed.y}`;
    }
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const brMatch = trimmed.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${day}-${month}-${year}`;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}-${month}-${year}`;
  }

  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    return fromDate(date);
  }

  return null;
};