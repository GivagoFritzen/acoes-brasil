import { ProventoEntity } from "../../domain/entities/ProventoEntity";

export interface PaginatedProventosResult {
  data: ProventoEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
