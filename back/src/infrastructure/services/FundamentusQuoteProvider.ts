import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { normalizeCodigoForFundamentus } from "../../shared/utils/FundamentusUtils";
import { logger } from "../../shared/logger/Logger";
import { parseDecimal } from "../../../../common/utils/parseDecimal";
import {
  FundamentusHttpService,
  LABEL_CLASS,
  DATA_CLASS,
  MAX_REGEX_ITERATIONS,
} from "./shared/FundamentusHttpService";

const COTACAO_LABEL = "cotacao";

export class FundamentusQuoteProvider
  extends FundamentusHttpService
  implements IQuoteProvider
{
  async getQuoteAsync(codigo: string): Promise<number | null> {
    const codigoFundamentus = normalizeCodigoForFundamentus(codigo);

    let html: string;
    try {
      const result = await this.fetchHtmlAsync(codigoFundamentus);
      if (!result.found) return null;
      html = result.html;
    } catch (error) {
      logger.error("Erro ao buscar cotação no Fundamentus", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }

    try {
      return this.findQuoteInHtml(html);
    } catch (error) {
      logger.error("Erro ao buscar cotação no Fundamentus", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private findQuoteInHtml(html: string): number | null {
    let pos = 0;
    let iterations = 0;

    while (
      pos < html.length &&
      iterations < MAX_REGEX_ITERATIONS
    ) {
      iterations++;
      const result = this.tryExtractQuote(html, pos);
      if (result === null) return null;
      if (result.quote !== undefined) return result.quote;
      pos = result.nextPos;
    }

    return null;
  }

  private tryExtractQuote(
    html: string,
    pos: number
  ): { quote?: number; nextPos: number } | null {
    const labelResult = this.extractHtmlSegment(
      html,
      pos,
      LABEL_CLASS,
      "</td>"
    );
    if (!labelResult) return null;

    const normalizedLabel = this.normalizeLabelForSearch(labelResult.text);
    if (normalizedLabel !== COTACAO_LABEL) {
      return { nextPos: labelResult.nextPos };
    }

    const dataResult = this.extractHtmlSegment(
      html,
      labelResult.nextPos,
      DATA_CLASS,
      "</td>"
    );
    if (!dataResult) return null;

    const quote = parseDecimal(dataResult.text);
    if (quote === null) return null;

    return { quote, nextPos: dataResult.nextPos };
  }
}