export function formatDateForDisplay(dateValue: unknown): string {
  if (dateValue === null || dateValue === undefined) {
    return '';
  }

  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = String(dateValue.getFullYear());
    return `${day}-${month}-${year}`;
  }

  const raw = String(dateValue).trim();
  if (!raw) {
    return '';
  }

  const datePart = raw.split('T')[0];

  const yyyyMmDd = /^(\d{4})-(\d{2})-(\d{2})$/;
  const ddMmYyyy = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;

  const isoMatch = datePart.match(yyyyMmDd);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}-${month}-${year}`;
  }

  const brMatch = datePart.match(ddMmYyyy);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${day}-${month}-${year}`;
  }

  return raw;
}
