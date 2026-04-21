import type { OrderOperacao } from './order-operacao.model';
import type { OrderTipo } from './order-tipo.model';

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
