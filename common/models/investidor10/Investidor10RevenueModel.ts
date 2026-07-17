export interface Investidor10RegiaoReceita {
  nome: string;
  porcentagem: number;
}

export interface Investidor10SegmentoReceita {
  nome: string;
  porcentagem: number;
}

export interface Investidor10ReceitaAno {
  ano: number;
  receitaTotal: string;
  regioes: Investidor10RegiaoReceita[];
  negocios: Investidor10SegmentoReceita[];
}
