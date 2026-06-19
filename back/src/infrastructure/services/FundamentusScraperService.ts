import type { FundamentusAcaoDetails } from "../../../../common/models/fundamentus";
import { normalizeCodigoForFundamentus } from "../../shared/utils/FundamentusUtils";
import {
  FundamentusHttpService,
  LABEL_CLASS,
  DATA_CLASS,
  MAX_REGEX_ITERATIONS,
} from "./shared/FundamentusHttpService";

export class FundamentusScraperService extends FundamentusHttpService {
  async scrapeAsync(codigo: string): Promise<FundamentusAcaoDetails> {
    const codigoFundamentus = normalizeCodigoForFundamentus(codigo);
    const { html, found } = await this.fetchHtmlAsync(codigoFundamentus);

    if (!found) {
      throw new Error(
        `Falha ao consultar Fundamentus para o ativo ${codigo}.`
      );
    }

    const parsed = this.parseFundamentusDetails(codigo, html);

    if (!parsed.indicadores.length) {
      throw new Error("Não foi possível extrair dados do Fundamentus.");
    }

    return parsed;
  }

  private parseFundamentusDetails(
    codigo: string,
    html: string
  ): FundamentusAcaoDetails {
    const indicadoresMap = new Map<string, string>();
    let pos = 0;
    let iterations = 0;

    while (
      pos < html.length &&
      iterations < MAX_REGEX_ITERATIONS
    ) {
      iterations++;
      const nextPos = this.extractNextIndicator(html, pos, indicadoresMap);
      if (nextPos === null) break;
      pos = nextPos;
    }

    const empresa = indicadoresMap.get("Empresa") ?? null;
    const setor = indicadoresMap.get("Setor") ?? null;
    const subsetor = indicadoresMap.get("Subsetor") ?? null;

    const indicadores = Array.from(indicadoresMap.entries())
      .filter(([label]) => !["Empresa", "Setor", "Subsetor"].includes(label))
      .map(([label, value]) => ({ label, value }));

    return {
      codigo,
      empresa,
      setor,
      subsetor,
      indicadores,
      updatedAt: new Date().toISOString(),
    };
  }

  private extractNextIndicator(
    html: string,
    pos: number,
    indicadoresMap: Map<string, string>
  ): number | null {
    const labelResult = this.extractHtmlSegment(
      html,
      pos,
      LABEL_CLASS,
      "</td>"
    );
    if (!labelResult) return null;

    const dataResult = this.extractHtmlSegment(
      html,
      labelResult.nextPos,
      DATA_CLASS,
      "</td>"
    );
    if (!dataResult) return null;

    const label = this.normalizeLabel(labelResult.text);
    const value = dataResult.text;

    if (label && value && !indicadoresMap.has(label)) {
      indicadoresMap.set(label, value);
    }

    return dataResult.nextPos;
  }
}