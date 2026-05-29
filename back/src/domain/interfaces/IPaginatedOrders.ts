import { OrderEntity } from "../entities/OrderEntity";

export interface IPaginatedOrders {
  data: OrderEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
