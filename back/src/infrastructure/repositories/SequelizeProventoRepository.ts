import { Op, Transaction, WhereOptions } from "sequelize";
import { sequelize } from "../../database";
import { buildBrDateOrderExpression } from "../../database/DateExpression";
import { Provento as ProventoModel } from "../../models/provento/Provento";
import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { IProventoFilters } from "../../domain/interfaces/IProventoFilters";
import { DateUtils } from "../../shared/utils/DateUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";

export class SequelizeProventoRepository implements IProventoRepository {
  async createAsync(
    proventoData: Omit<ProventoEntity, "id" | "createdAt" | "updatedAt">,
    tx?: object
  ): Promise<ProventoEntity> {
    const transaction = tx as Transaction | undefined;
    const model = await ProventoModel.create(
      {
        codigo: proventoData.codigo,
        data: proventoData.data,
        tipo: proventoData.tipo,
        instituicao: proventoData.instituicao,
        quantidade: proventoData.quantidade,
        precoUnitario: proventoData.precoUnitario,
        valorLiquido: proventoData.valorLiquido,
      },
      { transaction }
    );
    return this.toEntity(model);
  }

  async createManyAsync(
    proventos: Omit<ProventoEntity, "id" | "createdAt" | "updatedAt">[],
    tx?: object
  ): Promise<ProventoEntity[]> {
    const results: ProventoEntity[] = [];
    for (const provento of proventos) {
      results.push(await this.createAsync(provento, tx));
    }
    return results;
  }

  async findByIdAsync(id: string, tx?: object): Promise<ProventoEntity | null> {
    const transaction = tx as Transaction | undefined;
    const model = await ProventoModel.findByPk(id, { transaction });
    if (!model) return null;
    return this.toEntity(model);
  }

  async deleteAsync(id: string, tx?: object): Promise<void> {
    const transaction = tx as Transaction | undefined;
    await ProventoModel.destroy({ where: { id }, transaction });
  }

  async findAllAsync(filters: IProventoFilters): Promise<{ rows: ProventoEntity[]; count: number }> {
    const pageNumber = Math.max(filters.page ?? 1, 1);
    const limitNumber = Math.max(filters.limit ?? 20, 1);
    const offset = (pageNumber - 1) * limitNumber;

    const where: Record<string | symbol, object | string | number | Date | boolean | null> = {};
    const andConditions: object[] = [];
    const dataAsDate = buildBrDateOrderExpression("provento");

    const startDate = DateUtils.normalizeToIsoDate(filters.dataInicial) ?? DateUtils.normalizeToIsoDate(filters.data);
    const endDate = DateUtils.normalizeToIsoDate(filters.dataFinal);

    if (startDate && endDate) {
      andConditions.push(sequelize.where(dataAsDate, { [Op.between]: [startDate, endDate] }));
    } else if (startDate) {
      andConditions.push(sequelize.where(dataAsDate, { [Op.gte]: startDate }));
    } else if (endDate) {
      andConditions.push(sequelize.where(dataAsDate, { [Op.lte]: endDate }));
    }

    if (filters.codigo) {
      where.codigo = { [Op.like]: `%${normalizeOrderCodigo(filters.codigo)}%` };
    }

    if (filters.tipo) {
      where.tipo = filters.tipo.trim();
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    if (filters.agruparPorCodigo) {
      return this.findAllGroupedAsync(where, dataAsDate, offset, limitNumber);
    }

    const { rows, count } = await ProventoModel.findAndCountAll({
      where,
      order: [[dataAsDate, "DESC"]],
      limit: limitNumber,
      offset,
    });

    return { rows: rows.map((m) => this.toEntity(m)), count };
  }

  private async findAllGroupedAsync(
    where: WhereOptions,
    dataAsDate: ReturnType<typeof buildBrDateOrderExpression>,
    offset: number,
    limit: number
  ): Promise<{ rows: ProventoEntity[]; count: number }> {
    const allRows = await ProventoModel.findAll({
      where,
      order: [[dataAsDate, "DESC"]],
    });

    const groupedMap = new Map<string, ProventoEntity>();

    for (const row of allRows) {
      const codigoKey = String(row.codigo ?? "").trim().toUpperCase();
      const tipoKey = String(row.tipo ?? "").trim();
      const groupKey = `${codigoKey}::${tipoKey}`;
      const existing = groupedMap.get(groupKey);

      if (!existing) {
        groupedMap.set(groupKey, new ProventoEntity(
          row.id,
          codigoKey,
          "",
          row.tipo,
          "",
          row.quantidade,
          row.precoUnitario,
          row.valorLiquido,
          row.createdAt,
          row.updatedAt
        ));
        continue;
      }

      const quantidade = existing.quantidade + row.quantidade;
      const valorLiquido = existing.valorLiquido + row.valorLiquido;
      const precoUnitario = quantidade > 0 ? valorLiquido / quantidade : 0;

      groupedMap.set(groupKey, new ProventoEntity(
        existing.id,
        codigoKey,
        "",
        existing.tipo,
        "",
        quantidade,
        precoUnitario,
        valorLiquido,
        existing.createdAt,
        existing.updatedAt
      ));
    }

    const groupedRows = Array.from(groupedMap.values());
    const count = groupedRows.length;
    const paginatedRows = groupedRows.slice(offset, offset + limit);

    return { rows: paginatedRows, count };
  }

  private toEntity(model: ProventoModel): ProventoEntity {
    return new ProventoEntity(
      model.id,
      model.codigo,
      model.data,
      model.tipo,
      model.instituicao,
      model.quantidade,
      model.precoUnitario,
      model.valorLiquido,
      model.createdAt,
      model.updatedAt
    );
  }
}
