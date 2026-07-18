import { Transaction } from "sequelize";
import { Portfolio as PortfolioModel } from "../../models/portfolio/Portfolio";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";

export class SequelizePortfolioRepository implements IPortfolioRepository {
  async createAsync(portfolioData: Omit<PortfolioEntity, "id" | "createdAt" | "updatedAt" | "registerCompra" | "registerVenda">, tx?: object): Promise<PortfolioEntity> {
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

  async findByIdAsync(id: string, tx?: object): Promise<PortfolioEntity | null> {
    const transaction = tx as Transaction | undefined;
    const model = await PortfolioModel.findByPk(id, { transaction });
    if (!model) return null;
    return this.toEntity(model);
  }

  async findByCodigoAsync(codigo: string, tx?: object): Promise<PortfolioEntity | null> {
    const transaction = tx as Transaction | undefined;
    const model = await PortfolioModel.findOne({ where: { codigo }, transaction });
    if (!model) return null;
    return this.toEntity(model);
  }

  async findAllAsync(tx?: object): Promise<PortfolioEntity[]> {
    const transaction = tx as Transaction | undefined;
    const models = await PortfolioModel.findAll({ order: [["createdAt", "DESC"]], transaction });
    return models.map((m) => this.toEntity(m));
  }

  async saveAsync(portfolio: PortfolioEntity, tx?: object): Promise<PortfolioEntity> {
    const transaction = tx as Transaction | undefined;
    const model = await PortfolioModel.findByPk(portfolio.id, { transaction });
    
    if (!model) {
      throw new Error(`portfolio with ID ${portfolio.id} not found to save.`);
    }

    model.quantidade = portfolio.quantidade;
    model.precoMedio = portfolio.precoMedio;
    
    await model.save({ transaction });
    return this.toEntity(model);
  }

  async deleteByCodigoAsync(codigo: string, tx?: object): Promise<void> {
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
