import type { Investidor10Indicator } from './Investidor10IndicatorModel';
import type { Investidor10HistoricoIndicador } from './Investidor10HistoricoIndicadorModel';
import type { Investidor10Imovel } from './Investidor10ImovelModel';
import type { Investidor10InformacaoFii } from './Investidor10InformacaoFiiModel';
import type { Investidor10FiiIndicadorFundamentalista } from './Investidor10FiiIndicadorFundamentalistaModel';

export interface Investidor10FiiDetails {
  codigo: string;
  empresa: string | null;
  dadosSobreEmpresa: Investidor10Indicator[];
  informacoesSobreEmpresa: Investidor10Indicator[];
  indicadoresFundamentalistas: Investidor10Indicator[];
  historicoIndicadores: Investidor10HistoricoIndicador[];
  imoveis: Investidor10Imovel[];
  informacoesFii: Investidor10InformacaoFii[];
  indicadoresFundamentalistasFii: Investidor10FiiIndicadorFundamentalista[];
  updatedAt: string;
}