import type { PaginatedResponse } from '../../../../../common/models/paginated-response.model';
import type { Order } from './order.model';

export type OrdersResponse = PaginatedResponse<Order>;