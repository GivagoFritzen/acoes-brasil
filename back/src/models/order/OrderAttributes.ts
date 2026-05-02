import { OrderOperacao } from "./OrderOperacao";
import { OrderTipo } from "./OrderTipo";

export interface OrderAttributes {
  id: string;
  codigo: string;
  valor: number;
  quantidade: number;
  data: string;
  tipo: OrderTipo;
  operacao: OrderOperacao;
  createdAt?: Date;
  updatedAt?: Date;
}
