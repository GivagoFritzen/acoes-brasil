import { PortfolioEntity } from "../entities/PortfolioEntity";

export interface IPortfolioRepository {
  createAsync(portfolio: Omit<PortfolioEntity, "id" | "createdAt" | "updatedAt" | "registerCompra" | "registerVenda">, tx?: unknown): Promise<PortfolioEntity>;
  findByIdAsync(id: string, tx?: unknown): Promise<PortfolioEntity | null>;
  findByCodigoAsync(codigo: string, tx?: unknown): Promise<PortfolioEntity | null>;
  findAllAsync(tx?: unknown): Promise<PortfolioEntity[]>;
  saveAsync(portfolio: PortfolioEntity, tx?: unknown): Promise<PortfolioEntity>;
  deleteByCodigoAsync(codigo: string, tx?: unknown): Promise<void>;
}
