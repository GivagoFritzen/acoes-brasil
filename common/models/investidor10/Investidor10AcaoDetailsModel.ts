import type { Investidor10Indicator } from './Investidor10IndicatorModel';
import type { Investidor10HistoricoIndicador } from './Investidor10HistoricoIndicadorModel';
import type { Investidor10ReceitaAno } from './Investidor10ReceitaAnoModel';
import type { Investidor10FiiIndicadorFundamentalista } from './Investidor10FiiIndicadorFundamentalistaModel';

export interface Investidor10AcaoDetails {
  codigo: string;
  empresa: string | null;
  dadosSobreEmpresa: Investidor10Indicator[];
  informacoesSobreEmpresa: Investidor10Indicator[];
  indicadoresFundamentalistas: Investidor10Indicator[];
  historicoIndicadores: Investidor10HistoricoIndicador[];
  indicadoresFundamentalistasComHistorico: Investidor10FiiIndicadorFundamentalista[];
  receitas: Investidor10ReceitaAno[];
  updatedAt: string;
}
