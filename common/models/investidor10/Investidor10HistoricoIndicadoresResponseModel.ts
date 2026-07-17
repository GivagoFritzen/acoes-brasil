import type { Investidor10HistoricoIndicador } from './Investidor10HistoricoIndicadorModel';

export interface Investidor10HistoricoIndicadoresResponse {
  codigo: string;
  periodos: number[];
  historico: Investidor10HistoricoIndicador[];
  updatedAt: string;
}
