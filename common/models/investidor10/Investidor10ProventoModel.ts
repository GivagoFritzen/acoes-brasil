export interface Investidor10Provento {
  data: string;
  tipo: string;
  valor: string;
}

export interface Investidor10ProventosResponse {
  codigo: string;
  proventos: Investidor10Provento[];
  updatedAt: string;
}
