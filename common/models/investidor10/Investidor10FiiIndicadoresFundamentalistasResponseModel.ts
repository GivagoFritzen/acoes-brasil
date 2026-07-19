import type { Investidor10FiiIndicadorFundamentalista } from './Investidor10FiiIndicadorFundamentalistaModel';

export interface Investidor10FiiIndicadoresFundamentalistasResponse {
  codigo: string;
  periodos: string[];
  indicadores: Investidor10FiiIndicadorFundamentalista[];
  updatedAt: string;
}
