import { OrderEntity } from "../entities/OrderEntity";
import { IOrderFilters } from "./IOrderFilters";
import { IPaginatedOrders } from "./IPaginatedOrders";

export interface IOrderRepository {
  createAsync(order: Omit<OrderEntity, "id" | "createdAt" | "updatedAt" | "isCompra" | "isVenda">, tx?: unknown): Promise<OrderEntity>;
  findByIdAsync(id: string, tx?: unknown): Promise<OrderEntity | null>;
  findAllByCodigoAsync(codigo: string, tx?: unknown): Promise<OrderEntity[]>;
  findAllPaginatedAsync(filters: IOrderFilters, page: number, limit: number, tx?: unknown): Promise<IPaginatedOrders>;
  deleteAsync(id: string, tx?: unknown): Promise<void>;
  countAsync(filters: IOrderFilters, tx?: unknown): Promise<number>;
}
