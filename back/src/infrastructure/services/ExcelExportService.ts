import * as XLSX from "xlsx";

export interface SellSnapshotExportRow {
  Data: string;
  Ativo: string;
  "Preço Médio": number;
  "Quantidade Vendida": number;
  "Preço Venda": number;
  "Custo Médio Total": number;
  "Valor Total Venda": number;
  "Lucro/Perda": number;
}

export class ExcelExportService {
  generateAsync(rows: SellSnapshotExportRow[], fileName: string): Buffer {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }
}
