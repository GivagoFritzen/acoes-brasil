import type { Investidor10RegiaoReceita } from './Investidor10RegiaoReceitaModel';
import type { Investidor10SegmentoReceita } from './Investidor10SegmentoReceitaModel';

export interface Investidor10ReceitaAno {
  ano: number;
  receitaTotal: string;
  regioes: Investidor10RegiaoReceita[];
  negocios: Investidor10SegmentoReceita[];
}
