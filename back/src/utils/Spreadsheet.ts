import * as XLSX from "xlsx";

export type SpreadsheetRow = Record<string, unknown>;
export { parseDecimal } from "../../../common/utils/ParseDecimal";

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