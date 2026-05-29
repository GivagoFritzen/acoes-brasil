import type { PaginatedResponse } from '../../../../../common/models/PaginatedResponseModel';
import type { Order } from './OrderModel';

export type OrdersResponse = PaginatedResponse<Order>;