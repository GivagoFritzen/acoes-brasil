import * as XLSX from "xlsx";
import { SellSnapshotExportRow } from "./SellSnapshotExportRow";

export class ExcelExportService {
  generateAsync(rows: SellSnapshotExportRow[], fileName: string): Buffer {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }
}
