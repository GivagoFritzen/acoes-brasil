import type {
  Investidor10FiiIndicadorFundamentalista,
  Investidor10Indicator, 
  Investidor10InformacaoFii,
   Investidor10HistoricoIndicador
} from "../../../common/models/investidor10";

export interface Investidor10ServiceTest {
  parseRevenueData(html: string): object[];
  extractStockId(html: string): string | null;
  fetchHistoricoIndicadoresAsync(stockId: string): object[];
  extractJSObject(html: string, varName: string): string | null;
  sanitizeJSON(json: string): string;
  mapRegioes(data: object | null): object[];
  mapNegocios(data: object | null): object[];
  parseFiiCardsTicker(html: string): Map<string, string>;
  parseFiiIndicadoresFundamentalistas(
    html: string,
    informacoesFii: Investidor10InformacaoFii[],
    historicoIndicadores: Investidor10HistoricoIndicador[]
  ): Investidor10FiiIndicadorFundamentalista[];
  parseIndicadoresFundamentalistasComHistorico(
    indicadoresFundamentalistas: Investidor10Indicator[],
    historicoIndicadores: Investidor10HistoricoIndicador[]
  ): Investidor10FiiIndicadorFundamentalista[];
  parseMonetaryValue(value: string): number;
  formatMonetaryValue(value: number): string;
}
