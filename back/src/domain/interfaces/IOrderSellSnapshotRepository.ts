import { OrderSellSnapshotEntity } from "../entities/OrderSellSnapshotEntity";

export interface IOrderSellSnapshotRepository {
  createAsync(snapshot: Omit<OrderSellSnapshotEntity, "id" | "createdAt" | "updatedAt">, tx?: object): Promise<OrderSellSnapshotEntity>;
  findAllAsync(ano?: string, tx?: object): Promise<OrderSellSnapshotEntity[]>;
}
