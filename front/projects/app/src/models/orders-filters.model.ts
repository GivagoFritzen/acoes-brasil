import { OrderOperacao } from "./order.model";

export interface OrdersFilters {
    codigo: string;
    operacao: OrderOperacao | '';
    dataInicial: string;
    dataFinal: string;
}
