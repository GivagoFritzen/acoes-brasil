import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { IProventoFilters } from "../../domain/interfaces/IProventoFilters";
import { DateUtils } from "../../shared/utils/DateUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/order-codigo.utils";

export interface PaginatedProventosResult {
  data: ProventoEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ListProventosUseCase {
  constructor(private proventoRepository: IProventoRepository) {}

  public async executeAsync(filters: IProventoFilters): Promise<PaginatedProventosResult> {
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.max(filters.limit ?? 20, 1);

    const normalizedFilters: IProventoFilters = {
      ...filters,
      page,
      limit,
      codigo: filters.codigo ? normalizeOrderCodigo(filters.codigo) : undefined,
      data: DateUtils.normalizeToIsoDate(filters.data) ?? undefined,
      dataInicial: DateUtils.normalizeToIsoDate(filters.dataInicial) ?? undefined,
      dataFinal: DateUtils.normalizeToIsoDate(filters.dataFinal) ?? undefined,
    };

    const { rows, count } = await this.proventoRepository.findAllAsync(normalizedFilters);

    return {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 1,
    };
  }
}
