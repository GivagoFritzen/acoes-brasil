import { OrderSellSnapshotEntity } from "../entities/OrderSellSnapshotEntity";

export interface IOrderSellSnapshotRepository {
  createAsync(snapshot: Omit<OrderSellSnapshotEntity, "id" | "createdAt" | "updatedAt">, tx?: unknown): Promise<OrderSellSnapshotEntity>;
  findAllAsync(ano?: string, tx?: unknown): Promise<OrderSellSnapshotEntity[]>;
}
