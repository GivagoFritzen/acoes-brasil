import type { OrderOperacao, OrderTipo } from './order.model';

export interface CreateOrderPayload {
  codigo: string;
  quantidade: number;
  valor: number;
  data: string;
  tipo: OrderTipo;
  operacao: OrderOperacao;
}
