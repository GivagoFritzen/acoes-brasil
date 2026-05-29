import type { OrderOperacao } from './OrderOperacaoModel';
import type { OrderTipo } from './OrderTipoModel';

export interface Order {
  id: string;
  codigo: string;
  valor: number;
  quantidade: number;
  data: string;
  tipo: OrderTipo;
  operacao: OrderOperacao;
  createdAt?: string;
  updatedAt?: string;
}
