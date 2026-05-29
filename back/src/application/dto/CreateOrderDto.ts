import type { OrderOperacao as orderOperacao, OrderTipo as orderTipo } from "../../../../common/models/order";

export interface CreateOrderDto {
  codigo: string;
  quantidade: number;
  valor: number;
  data: string;
  tipo: orderTipo;
  operacao: orderOperacao;
}
