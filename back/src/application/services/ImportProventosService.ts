import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { CreateProventoDto } from "../dto/CreateProventoDto";
import { ImportProventosResult } from "../dto/ImportProventosResult";
import { DateUtils } from "../../shared/utils/DateUtils";
import { isSupportedB3Ticker } from "../../../../common/utils/AssetTypeUtils";
import { BusinessException } from "../../shared/exceptions/BusinessException";
import { translationService } from "../../shared/i18n/TranslationService";

export class ImportProventosService {
  constructor(
    private proventoRepository: IProventoRepository,
    private transactionManager: ITransactionManager
  ) {}

  public async executeAsync(linhas: CreateProventoDto[], lang?: string): Promise<ImportProventosResult> {
    return this.transactionManager.executeAsync(async (tx) => {
      const invalidLines: number[] = [];
      const validLinhas: CreateProventoDto[] = [];

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
          DateUtils.isFutureDate(linha.data)
        ) {
          invalidLines.push(lineNumber);
          continue;
        }

        validLinhas.push(linha);
      }

      if (validLinhas.length === 0 && invalidLines.length > 0) {
        throw new BusinessException(translationService.translate('import.noValidLines', lang, { line: invalidLines[0] }));
      }

      if (validLinhas.length > 0) {
        await this.proventoRepository.createManyAsync(validLinhas, tx);
      }

      return { imported: validLinhas.length, skipped: invalidLines.length, invalidLines };
    });
  }
}
