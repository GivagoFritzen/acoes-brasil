import { OrderOperacao } from "./OrderModel";

export interface OrdersFilters {
    codigo: string;
    operacao: OrderOperacao | '';
    dataInicial: string;
    dataFinal: string;
}
