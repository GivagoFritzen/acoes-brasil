export class DateUtils {
  static normalizeToBrDateString(val: unknown): string {
    if (!val) return "";
    const str = String(val).trim();
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
    const isoFullMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoFullMatch) return `${isoFullMatch[3]}-${isoFullMatch[2]}-${isoFullMatch[1]}`;
    return str;
  }

  static normalizeToIsoDate(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmedValue = value.trim();
    const brDateMatch = trimmedValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (brDateMatch) {
      const [, day, month, year] = brDateMatch;
      return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }
    return null;
  }

  static isFutureBrDate(dateStr: string): boolean {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return false;
    const [day, month, year] = parts;
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    dateObj.setHours(23, 59, 59, 999);
    return dateObj > new Date();
  }

  static generateFileName(prefix: string, extension: string = 'xlsx'): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    return `${prefix}-${dateStr}.${extension}`;
  }
}
