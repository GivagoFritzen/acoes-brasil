import type { Investidor10Indicator } from './Investidor10IndicatorModel';
import type { Investidor10HistoricoIndicador } from './Investidor10HistoricoIndicadorModel';
import type { Investidor10ReceitaAno } from './Investidor10RevenueModel';

export interface Investidor10AcaoDetails {
  codigo: string;
  empresa: string | null;
  dadosSobreEmpresa: Investidor10Indicator[];
  informacoesSobreEmpresa: Investidor10Indicator[];
  indicadoresFundamentalistas: Investidor10Indicator[];
  historicoIndicadores: Investidor10HistoricoIndicador[];
  receitas: Investidor10ReceitaAno[];
  updatedAt: string;
}
