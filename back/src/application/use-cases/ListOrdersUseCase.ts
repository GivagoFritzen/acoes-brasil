import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IOrderFilters } from "../../domain/interfaces/IOrderFilters";
import { IPaginatedOrders } from "../../domain/interfaces/IPaginatedOrders";

export class ListOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  public async executeAsync(filters: IOrderFilters, page: number = 1, limit: number = 20): Promise<IPaginatedOrders> {
    const pageNumber = Math.max(page, 1);
    const limitNumber = Math.max(limit, 1);

    const result = await this.orderRepository.findAllPaginatedAsync(filters, pageNumber, limitNumber);
    return result;
  }
}
