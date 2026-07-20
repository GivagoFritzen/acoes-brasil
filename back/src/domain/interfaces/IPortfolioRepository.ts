import { PortfolioEntity } from "../entities/PortfolioEntity";

export interface IPortfolioRepository {
  createAsync(portfolio: Omit<PortfolioEntity, "id" | "createdAt" | "updatedAt" | "registerCompra" | "registerVenda">, tx?: object): Promise<PortfolioEntity>;
  findByIdAsync(id: string, tx?: object): Promise<PortfolioEntity | null>;
  findByCodigoAsync(codigo: string, tx?: object): Promise<PortfolioEntity | null>;
  findAllAsync(tx?: object): Promise<PortfolioEntity[]>;
  saveAsync(portfolio: PortfolioEntity, tx?: object): Promise<PortfolioEntity>;
  deleteByCodigoAsync(codigo: string, tx?: object): Promise<void>;
}
