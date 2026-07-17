import * as XLSX from "xlsx";

export class ExcelExportService {
  generateAsync(rows: Record<string, any>[], sheetName: string = "Vendas"): Buffer {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }
}
