import { Investidor10ValorPorPeriodo } from "./Investidor10ValorPorPeriodoModel";

export interface Investidor10FiiIndicadorFundamentalista {
  nome: string;
  valores: Investidor10ValorPorPeriodo[];
  tipo: 'moeda' | 'percentual' | 'numerico' | 'decimal';
}
