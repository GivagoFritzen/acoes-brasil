import { OrderEntity } from "../entities/OrderEntity";
import { IOrderFilters } from "./IOrderFilters";
import { IPaginatedOrders } from "./IPaginatedOrders";

export interface IOrderRepository {
  createAsync(order: Omit<OrderEntity, "id" | "createdAt" | "updatedAt" | "isCompra" | "isVenda">, tx?: object): Promise<OrderEntity>;
  findByIdAsync(id: string, tx?: object): Promise<OrderEntity | null>;
  findAllByCodigoAsync(codigo: string, tx?: object): Promise<OrderEntity[]>;
  findAllPaginatedAsync(filters: IOrderFilters, page: number, limit: number, tx?: object): Promise<IPaginatedOrders>;
  deleteAsync(id: string, tx?: object): Promise<void>;
}
