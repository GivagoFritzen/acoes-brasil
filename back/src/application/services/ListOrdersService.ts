import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IOrderFilters } from "../../domain/interfaces/IOrderFilters";
import { IPaginatedOrders } from "../../domain/interfaces/IPaginatedOrders";
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from "../../shared/constants/Pagination";

export class ListOrdersService {
  constructor(private orderRepository: IOrderRepository) {}

  public async executeAsync(filters: IOrderFilters, page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT): Promise<IPaginatedOrders> {
    const pageNumber = Math.max(page, 1);
    const limitNumber = Math.min(Math.max(limit, 1), MAX_LIMIT);

    const result = await this.orderRepository.findAllPaginatedAsync(filters, pageNumber, limitNumber);
    return result;
  }
}
