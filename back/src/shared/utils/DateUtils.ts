export class DateUtils {
  static normalizeToBrDateString(val: string | number | boolean | null | undefined): string {
    if (!val) return "";
    const str = String(val).trim();
    const brDatePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (brDatePattern.test(str)) return str;
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
    const isoFullMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoFullMatch) return `${isoFullMatch[3]}-${isoFullMatch[2]}-${isoFullMatch[1]}`;
    return str;
  }

  static normalizeToIsoDate(value: string | null | undefined): string | null {
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

  static isFutureDate(value: string): boolean {
    const iso = this.normalizeToIsoDate(value) || value;
    const parsed = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return parsed.getTime() > today.getTime();
  }

  static isFutureBrDate(value: string): boolean {
    return this.isFutureDate(value);
  }

  static isValidBrDate(value: string): boolean {
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;
    return true;
  }

  static getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${year}-${month}-${day}`;
  }

  static getCurrentBrDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }

  static generateFileName(prefix: string, extension: string = 'xlsx'): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    return `${prefix}-${dateStr}.${extension}`;
  }

}
