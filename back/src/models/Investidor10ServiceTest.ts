export interface Investidor10ServiceTest {
  parseRevenueData(html: string): object[];
  extractStockId(html: string): string | null;
  fetchHistoricoIndicadoresAsync(stockId: string): object[];
  extractJSObject(html: string, varName: string): string | null;
  sanitizeJSON(json: string): string;
  mapRegioes(data: object | null): object[];
  mapNegocios(data: object | null): object[];
}
