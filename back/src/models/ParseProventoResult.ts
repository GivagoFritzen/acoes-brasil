import { CreateProventoDto } from "../application/dto/CreateProventoDto";

export interface ParseProventoResult {
  validRows: CreateProventoDto[];
  invalidLineNumbers: number[];
}
