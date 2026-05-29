import { sequelize } from "../../database";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";

export class SequelizeTransactionManager implements ITransactionManager {
  async executeAsync<T>(operation: (tx: unknown) => Promise<T>): Promise<T> {
    const transaction = await sequelize.transaction();
    try {
      const result = await operation(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
