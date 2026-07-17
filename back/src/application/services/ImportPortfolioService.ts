import { PortfolioImportRowDto } from "../dto/PortfolioImportRowDto";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";

export class ImportPortfolioService {
  constructor(
    private portfolioRepository: IPortfolioRepository,
    private transactionManager: ITransactionManager
  ) {}

  async executeAsync(rows: PortfolioImportRowDto[]): Promise<number> {
    if (!rows.length) {
      throw new Error("Nenhuma linha para importar.");
    }

    return this.transactionManager.executeAsync(async (tx) => {
      let imported = 0;

      for (const row of rows) {
        const existing = await this.portfolioRepository.findByCodigoAsync(row.codigo, tx);

        if (existing) {
          existing.quantidade = row.quantidade;
          existing.precoMedio = row.precoMedio;
          await this.portfolioRepository.saveAsync(existing, tx);
        } else {
          await this.portfolioRepository.createAsync(
            {
              codigo: row.codigo,
              quantidade: row.quantidade,
              precoMedio: row.precoMedio,
            },
            tx
          );
        }

        imported++;
      }

      return imported;
    });
  }
}
