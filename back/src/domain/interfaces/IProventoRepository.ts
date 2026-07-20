import { ProventoEntity } from "../entities/ProventoEntity";
import { IProventoFilters } from "./IProventoFilters";

export interface IProventoRepository {
  createAsync(
    provento: Omit<ProventoEntity, "id" | "createdAt" | "updatedAt">,
    tx?: object
  ): Promise<ProventoEntity>;
  createManyAsync(
    proventos: Omit<ProventoEntity, "id" | "createdAt" | "updatedAt">[],
    tx?: object
  ): Promise<ProventoEntity[]>;
  findByIdAsync(id: string, tx?: object): Promise<ProventoEntity | null>;
  findAllAsync(filters: IProventoFilters): Promise<{ rows: ProventoEntity[]; count: number }>;
  deleteAsync(id: string, tx?: object): Promise<void>;
}
