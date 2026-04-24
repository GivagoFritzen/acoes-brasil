import { OrderOperacao, OrderTipo } from "../../domain/entities/OrderEntity";

export interface CreateOrderDto {
  codigo: string;
  quantidade: number;
  valor: number;
  data: string;
  tipo: OrderTipo;
  operacao: OrderOperacao;
}
