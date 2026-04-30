import { Container } from "./Container";
import { SequelizeOrderRepository } from "../../infrastructure/repositories/SequelizeOrderRepository";
import { SequelizePortfolioRepository } from "../../infrastructure/repositories/SequelizePortfolioRepository";
import { SequelizeOrderSellSnapshotRepository } from "../../infrastructure/repositories/SequelizeOrderSellSnapshotRepository";
import { SequelizeProventoRepository } from "../../infrastructure/repositories/SequelizeProventoRepository";
import { FundamentusQuoteProvider } from "../../infrastructure/services/FundamentusQuoteProvider";
import { FundamentusScraperService } from "../../infrastructure/services/FundamentusScraperService";
import { SpreadsheetParserService } from "../../infrastructure/services/SpreadsheetParserService";
import { ExcelExportService } from "../../infrastructure/services/ExcelExportService";
import { SequelizeTransactionManager } from "../../infrastructure/database/SequelizeTransactionManager";
import { CreateOrderUseCase } from "../../application/use-cases/CreateOrderUseCase";
import { DeleteOrderUseCase } from "../../application/use-cases/DeleteOrderUseCase";
import { ListOrdersUseCase } from "../../application/use-cases/ListOrdersUseCase";
import { ImportOrdersUseCase } from "../../application/use-cases/ImportOrdersUseCase";
import { GetSellSnapshotsUseCase } from "../../application/use-cases/GetSellSnapshotsUseCase";
import { ExportSellSnapshotsUseCase } from "../../application/use-cases/ExportSellSnapshotsUseCase";
import { CreateOrUpdatePortfolioUseCase } from "../../application/use-cases/CreateOrUpdatePortfolioUseCase";
import { DeletePortfolioUseCase } from "../../application/use-cases/DeletePortfolioUseCase";
import { ListPortfolioUseCase } from "../../application/use-cases/ListPortfolioUseCase";
import { CreateProventoUseCase } from "../../application/use-cases/CreateProventoUseCase";
import { DeleteProventoUseCase } from "../../application/use-cases/DeleteProventoUseCase";
import { ImportProventosUseCase } from "../../application/use-cases/ImportProventosUseCase";
import { ListProventosUseCase } from "../../application/use-cases/ListProventosUseCase";

export function registerServices(): void {
  // Repositories
  Container.register('orderRepository', () => new SequelizeOrderRepository());
  Container.register('portfolioRepository', () => new SequelizePortfolioRepository());
  Container.register('sellSnapshotRepository', () => new SequelizeOrderSellSnapshotRepository());
  Container.register('proventoRepository', () => new SequelizeProventoRepository());

  // External Services
  Container.register('quoteProvider', () => new FundamentusQuoteProvider());
  Container.register('fundamentusScraper', () => new FundamentusScraperService());
  Container.register('spreadsheetParser', () => new SpreadsheetParserService());
  Container.register('excelExportService', () => new ExcelExportService());

  // Infrastructure
  Container.register('transactionManager', () => new SequelizeTransactionManager());

  // Use Cases - Order
  Container.register('createOrderUseCase', () => new CreateOrderUseCase(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('sellSnapshotRepository'),
    Container.get('quoteProvider'),
    Container.get('transactionManager')
  ));

  Container.register('deleteOrderUseCase', () => new DeleteOrderUseCase(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('transactionManager')
  ));

  Container.register('listOrdersUseCase', () => new ListOrdersUseCase(
    Container.get('orderRepository')
  ));

  Container.register('importOrdersUseCase', () => new ImportOrdersUseCase(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('sellSnapshotRepository'),
    Container.get('quoteProvider'),
    Container.get('transactionManager')
  ));

  Container.register('getSellSnapshotsUseCase', () => new GetSellSnapshotsUseCase(
    Container.get('sellSnapshotRepository')
  ));

  Container.register('exportSellSnapshotsUseCase', () => new ExportSellSnapshotsUseCase(
    Container.get('sellSnapshotRepository'),
    Container.get('excelExportService')
  ));

  // Use Cases - Portfolio
  Container.register('createOrUpdatePortfolioUseCase', () => new CreateOrUpdatePortfolioUseCase(
    Container.get('portfolioRepository')
  ));

  Container.register('deletePortfolioUseCase', () => new DeletePortfolioUseCase(
    Container.get('portfolioRepository')
  ));

  Container.register('listPortfolioUseCase', () => new ListPortfolioUseCase(
    Container.get('portfolioRepository')
  ));

  // Use Cases - Provento
  Container.register('createProventoUseCase', () => new CreateProventoUseCase(
    Container.get('proventoRepository')
  ));

  Container.register('deleteProventoUseCase', () => new DeleteProventoUseCase(
    Container.get('proventoRepository')
  ));

  Container.register('importProventosUseCase', () => new ImportProventosUseCase(
    Container.get('proventoRepository'),
    Container.get('transactionManager')
  ));

  Container.register('listProventosUseCase', () => new ListProventosUseCase(
    Container.get('proventoRepository')
  ));
}
