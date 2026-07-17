export interface Investidor10ValorHistorico {
  ano: number;
  valor: number;
  tipo: 'percent' | 'numeric';
}

export interface Investidor10HistoricoIndicador {
  indicador: string;
  valores: Investidor10ValorHistorico[];
}

export interface Investidor10HistoricoIndicadoresResponse {
  codigo: string;
  periodos: number[];
  historico: Investidor10HistoricoIndicador[];
  updatedAt: string;
}
