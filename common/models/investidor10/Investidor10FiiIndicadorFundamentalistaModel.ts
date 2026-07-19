export interface Investidor10ValorPorPeriodo {
  periodo: string;
  valor: string;
}

export interface Investidor10FiiIndicadorFundamentalista {
  nome: string;
  valores: Investidor10ValorPorPeriodo[];
  tipo: 'moeda' | 'percentual' | 'numerico' | 'decimal';
}
