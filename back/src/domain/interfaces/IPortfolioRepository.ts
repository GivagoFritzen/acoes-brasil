import { PortfolioEntity } from "../entities/PortfolioEntity";

export interface IPortfolioRepository {
  createAsync(portfolio: Omit<PortfolioEntity, "id" | "createdAt" | "updatedAt" | "registerCompra" | "registerVenda">, tx?: unknown): Promise<PortfolioEntity>;
  findByCodigoAsync(codigo: string, tx?: unknown): Promise<PortfolioEntity | null>;
  saveAsync(portfolio: PortfolioEntity, tx?: unknown): Promise<PortfolioEntity>;
  deleteByCodigoAsync(codigo: string, tx?: unknown): Promise<void>;
}
