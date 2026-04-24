import { Transaction } from "sequelize";
import { Portfolio as PortfolioModel } from "../../models/Portfolio";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";

export class SequelizePortfolioRepository implements IPortfolioRepository {
  async createAsync(portfolioData: Omit<PortfolioEntity, "id" | "createdAt" | "updatedAt" | "registerCompra" | "registerVenda">, tx?: unknown): Promise<PortfolioEntity> {
    const transaction = tx as Transaction | undefined;
    const model = await PortfolioModel.create(
      {
        codigo: portfolioData.codigo,
        quantidade: portfolioData.quantidade,
        precoMedio: portfolioData.precoMedio,
      },
      { transaction }
    );
    return this.toEntity(model);
  }

  async findByCodigoAsync(codigo: string, tx?: unknown): Promise<PortfolioEntity | null> {
    const transaction = tx as Transaction | undefined;
    const model = await PortfolioModel.findOne({ where: { codigo }, transaction });
    if (!model) return null;
    return this.toEntity(model);
  }

  async saveAsync(portfolio: PortfolioEntity, tx?: unknown): Promise<PortfolioEntity> {
    const transaction = tx as Transaction | undefined;
    const model = await PortfolioModel.findByPk(portfolio.id, { transaction });
    
    if (!model) {
      throw new Error(`Portfolio with ID ${portfolio.id} not found to save.`);
    }

    model.quantidade = portfolio.quantidade;
    model.precoMedio = portfolio.precoMedio;
    
    await model.save({ transaction });
    return this.toEntity(model);
  }

  async deleteByCodigoAsync(codigo: string, tx?: unknown): Promise<void> {
    const transaction = tx as Transaction | undefined;
    await PortfolioModel.destroy({ where: { codigo }, transaction });
  }

  private toEntity(model: PortfolioModel): PortfolioEntity {
    return new PortfolioEntity(
      model.id,
      model.codigo,
      model.quantidade,
      model.precoMedio,
      model.createdAt,
      model.updatedAt
    );
  }
}
