export interface FundamentusProvento {
  data: string;
  tipo: string;
  valor: string;
}

export interface FundamentusProventosResponse {
  codigo: string;
  proventos: FundamentusProvento[];
  updatedAt: string;
}
