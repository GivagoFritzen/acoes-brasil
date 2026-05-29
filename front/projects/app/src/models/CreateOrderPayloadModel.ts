import type { OrderOperacao, OrderTipo } from './OrderModel';

export interface CreateOrderPayload {
  codigo: string;
  quantidade: number;
  valor: number;
  data: string;
  tipo: OrderTipo;
  operacao: OrderOperacao;
}
