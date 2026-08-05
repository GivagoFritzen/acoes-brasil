import type { OrderOperacao, OrderTipo } from './OrderModel';

export interface UpdateOrderPayload {
  codigo: string;
  quantidade: number;
  valor: number;
  data: string;
  tipo: OrderTipo;
  operacao: OrderOperacao;
}