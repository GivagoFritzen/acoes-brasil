import { Op, WhereOptions } from "sequelize";
import { DateUtils } from "./DateUtils";
import { DateFilterParams } from "../../models/DateFilterParams";

export function buildDateWhereClause(field: string, filters: DateFilterParams): WhereOptions | null {
  const startDate = DateUtils.normalizeToIsoDate(filters.dataInicial) ?? DateUtils.normalizeToIsoDate(filters.data);
  const endDate = DateUtils.normalizeToIsoDate(filters.dataFinal);

  if (!startDate && !endDate) return null;

  const conditions: Record<string, unknown> = {};

  if (startDate && endDate) {
    conditions[field] = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    conditions[field] = { [Op.gte]: startDate };
  } else if (endDate) {
    conditions[field] = { [Op.lte]: endDate };
  }

  return conditions;
}
