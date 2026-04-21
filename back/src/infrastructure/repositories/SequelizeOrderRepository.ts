import { Op, Transaction, WhereOptions } from "sequelize";
import { sequelize } from "../../database";
import { buildBrDateOrderExpression } from "../../database/dateExpression";
import { Order as OrderModel } from "../../models/Order";
import { OrderEntity } from "../../domain/entities/OrderEntity";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IOrderFilters } from "../../domain/interfaces/IOrderFilters";
import { IPaginatedOrders } from "../../domain/interfaces/IPaginatedOrders";
import { DateUtils } from "../../shared/utils/DateUtils";

export class SequelizeOrderRepository implements IOrderRepository {
  async createAsync(orderData: Omit<OrderEntity, "id" | "createdAt" | "updatedAt" | "isCompra" | "isVenda">, tx?: unknown): Promise<OrderEntity> {
    const transaction = tx as Transaction | undefined;
    const model = await OrderModel.create(
      {
        codigo: orderData.codigo,
        valor: orderData.valor,
        quantidade: orderData.quantidade,
        data: orderData.data,
        tipo: orderData.tipo,
        operacao: orderData.operacao,
      },
      { transaction }
    );
    return this.toEntity(model);
  }

  async findByIdAsync(id: string, tx?: unknown): Promise<OrderEntity | null> {
    const transaction = tx as Transaction | undefined;
    const model = await OrderModel.findByPk(id, { transaction });
    if (!model) return null;
    return this.toEntity(model);
  }

  async findAllByCodigoAsync(codigo: string, tx?: unknown): Promise<OrderEntity[]> {
    const transaction = tx as Transaction | undefined;
    const models = await OrderModel.findAll({
      where: { codigo },
      order: [[buildBrDateOrderExpression("Order"), "ASC"], ["createdAt", "ASC"]],
      transaction,
    });
    return models.map(this.toEntity);
  }

  async findAllPaginatedAsync(filters: IOrderFilters, page: number, limit: number, tx?: unknown): Promise<IPaginatedOrders> {
    const transaction = tx as Transaction | undefined;
    const offset = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const { rows, count } = await OrderModel.findAndCountAll({
      where,
      order: [[buildBrDateOrderExpression("Order"), "DESC"]],
      limit,
      offset,
      transaction,
    });

    return {
      data: rows.map(this.toEntity),
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 1,
    };
  }

  async deleteAsync(id: string, tx?: unknown): Promise<void> {
    const transaction = tx as Transaction | undefined;
    await OrderModel.destroy({ where: { id }, transaction });
  }

  async countAsync(filters: IOrderFilters, tx?: unknown): Promise<number> {
    const transaction = tx as Transaction | undefined;
    return await OrderModel.count({ where: this.buildWhereClause(filters), transaction });
  }

  private buildWhereClause(filters: IOrderFilters): WhereOptions {
    const where: any = {};
    const andConditions: unknown[] = [];

    const normalizedDataInicial = DateUtils.normalizeToIsoDate(filters.dataInicial);
    const normalizedData = DateUtils.normalizeToIsoDate(filters.data);
    const normalizedDataFinal = DateUtils.normalizeToIsoDate(filters.dataFinal);

    const startDate = normalizedDataInicial ?? normalizedData;
    const endDate = normalizedDataFinal;
    const dataAsDate = buildBrDateOrderExpression("Order");

    if (startDate && endDate) {
      andConditions.push(sequelize.where(dataAsDate, { [Op.between]: [startDate, endDate] }));
    } else if (startDate) {
      andConditions.push(sequelize.where(dataAsDate, { [Op.gte]: startDate }));
    } else if (endDate) {
      andConditions.push(sequelize.where(dataAsDate, { [Op.lte]: endDate }));
    }

    if (filters.codigo?.trim()) {
      where.codigo = { [Op.like]: `%${filters.codigo.trim()}%` };
    }

    if (filters.operacao?.trim()) {
      where.operacao = filters.operacao.trim();
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    return where;
  }

  private toEntity(model: OrderModel): OrderEntity {
    return new OrderEntity(
      model.id,
      model.codigo,
      model.valor,
      model.quantidade,
      model.data,
      model.tipo,
      model.operacao,
      model.createdAt,
      model.updatedAt
    );
  }
}
