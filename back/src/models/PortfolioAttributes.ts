export interface PortfolioAttributes {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  precoMedio: number;
  createdAt?: Date;
  updatedAt?: Date;
}
