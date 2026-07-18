import { Op, Transaction } from "sequelize";
import { buildBrDateOrderExpression } from "../../database/DateExpression";
import { OrderSellSnapshot as OrderSellSnapshotModel } from "../../models/order/OrderSellSnapshot";
import { OrderSellSnapshotEntity } from "../../domain/entities/OrderSellSnapshotEntity";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";

export class SequelizeOrderSellSnapshotRepository implements IOrderSellSnapshotRepository {
  async createAsync(snapshot: Omit<OrderSellSnapshotEntity, "id" | "createdAt" | "updatedAt">, tx?: object): Promise<OrderSellSnapshotEntity> {
    const transaction = tx as Transaction | undefined;
    const model = await OrderSellSnapshotModel.create(
      {
        orderId: snapshot.orderId,
        codigo: snapshot.codigo,
        precoMedioAtual: snapshot.precoMedioAtual,
        quantidade: snapshot.quantidade,
        valorAtualAcao: snapshot.valorAtualAcao,
        ganhos: snapshot.ganhos,
        teveLucro: snapshot.teveLucro,
        data: snapshot.data,
      },
      { transaction }
    );
    return this.toEntity(model);
  }

  async findAllAsync(ano?: string, tx?: object): Promise<OrderSellSnapshotEntity[]> {
    const transaction = tx as Transaction | undefined;
    try {
      const where: Record<string, string | object> = {};
      if (ano) {
        where.data = { [Op.endsWith]: `-${ano}` };
      }

      const models = await OrderSellSnapshotModel.findAll({
        where,
        order: [[buildBrDateOrderExpression("OrderSellSnapshot"), "DESC"], ["createdAt", "DESC"]],
        transaction,
      });
      return models.map(this.toEntity);
    } catch (error) {
      const err = error as Error;
      if (this.isMissingTableError(err)) {
        return [];
      }
      throw err;
    }
  }

  private isMissingTableError(error: Error): boolean {
    const message = error instanceof Error ? error.message : String(error ?? "");
    const normalizedMessage = message.toLowerCase();
    return (
      normalizedMessage.includes("ordersellsnapshots") &&
      (normalizedMessage.includes("invalid object name") ||
        normalizedMessage.includes("no such table") ||
        normalizedMessage.includes("doesn't exist") ||
        normalizedMessage.includes("does not exist"))
    );
  }

  private toEntity(model: OrderSellSnapshotModel): OrderSellSnapshotEntity {
    return new OrderSellSnapshotEntity(
      model.id,
      model.orderId,
      model.codigo,
      model.precoMedioAtual,
      model.quantidade,
      model.valorAtualAcao,
      model.ganhos,
      model.teveLucro,
      model.data,
      model.createdAt,
      model.updatedAt
    );
  }
}
