import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { CreateProventoDto } from "../dto/CreateProventoDto";
import { ImportProventosResult } from "../dto/ImportProventosResult";
import { isFutureBrDate } from "../../utils/datas";
import { isSupportedB3Ticker } from "../../../../common/utils/asset-type.utils";

export class ImportProventosUseCase {
  constructor(
    private proventoRepository: IProventoRepository,
    private transactionManager: ITransactionManager
  ) {}

  public async executeAsync(linhas: CreateProventoDto[]): Promise<ImportProventosResult> {
    return this.transactionManager.executeAsync(async (tx) => {
      let imported = 0;
      const invalidLines: number[] = [];

      for (const [index, linha] of linhas.entries()) {
        const lineNumber = index + 1;

        if (
          !linha.codigo ||
          !isSupportedB3Ticker(linha.codigo) ||
          !linha.data ||
          !linha.tipo ||
          !linha.instituicao ||
          linha.quantidade <= 0 ||
          linha.valorLiquido < 0 ||
          isFutureBrDate(linha.data)
        ) {
          invalidLines.push(lineNumber);
          continue;
        }

        await this.proventoRepository.createAsync(linha, tx);
        imported++;
      }

      if (imported === 0 && invalidLines.length > 0) {
        throw new Error(`Nenhuma linha válida encontrada. Primeira linha inválida: ${invalidLines[0]}.`);
      }

      return { imported, skipped: invalidLines.length, invalidLines };
    });
  }
}
