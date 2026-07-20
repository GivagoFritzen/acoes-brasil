import type { Investidor10ValorHistorico } from './Investidor10ValorHistoricoModel';

export interface Investidor10HistoricoIndicador {
  indicador: string;
  valores: Investidor10ValorHistorico[];
}
