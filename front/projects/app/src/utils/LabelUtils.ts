export function normalizeLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\/\s.()$º]/g, '')
    .replace(/-/g, '')
    .replace(/%/g, '')
    .replace(/,/g, '')
    .replace(/:/g, '')
    .replace(/ /g, '');
}
