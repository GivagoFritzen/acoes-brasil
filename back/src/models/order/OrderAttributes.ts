import type { OrderOperacao as orderOperacao, OrderTipo as orderTipo } from "../../../../common/models/order";

export interface OrderAttributes {
  id: string;
  codigo: string;
  valor: number;
  quantidade: number;
  data: string;
  tipo: orderTipo;
  operacao: orderOperacao;
  createdAt?: Date;
  updatedAt?: Date;
}
