import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ExcelExportService } from "../../infrastructure/services/ExcelExportService";
import { PortfolioExportRow } from "../../models/PortfolioExportRow";
import { DateUtils } from "../../shared/utils/DateUtils";

export class ExportPortfolioService {
  constructor(
    private portfolioRepository: IPortfolioRepository,
    private excelExportService: ExcelExportService
  ) {}

  async executeAsync(): Promise<{ buffer: Buffer; fileName: string }> {
    const portfolios = await this.portfolioRepository.findAllAsync();

    const rows: PortfolioExportRow[] = portfolios.map((p) => ({
      Código: p.codigo,
      Quantidade: p.quantidade,
      "Preço Médio": p.precoMedio,
      "Valor Total": p.quantidade * p.precoMedio,
    }));

    const fileName = DateUtils.generateFileName("portfolio");
    const buffer = this.excelExportService.generateAsync(rows, "Portfolio");

    return { buffer, fileName };
  }
}
