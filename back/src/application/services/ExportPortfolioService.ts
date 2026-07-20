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

    const rows: PortfolioExportRow[] = portfolios.map((portfolio) => ({
      Código: portfolio.codigo,
      Quantidade: portfolio.quantidade,
      "Preço Médio": portfolio.precoMedio,
      "Valor Total": portfolio.quantidade * portfolio.precoMedio,
    }));

    const fileName = DateUtils.generateFileName("portfolio");
    const buffer = this.excelExportService.generateAsync(rows, "Portfolio");

    return { buffer, fileName };
  }
}
