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
import { CreateOrderService } from "../../application/services/CreateOrderService";
import { DeleteOrderService } from "../../application/services/DeleteOrderService";
import { ListOrdersService } from "../../application/services/ListOrdersService";
import { ImportOrdersService } from "../../application/services/ImportOrdersService";
import { GetSellSnapshotsService } from "../../application/services/GetSellSnapshotsService";
import { ExportSellSnapshotsService } from "../../application/services/ExportSellSnapshotsService";
import { CreateOrUpdatePortfolioService } from "../../application/services/CreateOrUpdatePortfolioService";
import { DeletePortfolioService } from "../../application/services/DeletePortfolioService";
import { ListPortfolioService } from "../../application/services/ListPortfolioService";
import { CreateProventoService } from "../../application/services/CreateProventoService";
import { DeleteProventoService } from "../../application/services/DeleteProventoService";
import { ImportProventosService } from "../../application/services/ImportProventosService";
import { ListProventosService } from "../../application/services/ListProventosService";

export function registerServices(): void {
  registerRepositories();
  registerExternalServices();
  registerInfrastructure();
  registerOrderServices();
  registerPortfolioServices();
  registerProventoServices();
}

function registerRepositories(): void {
  Container.register('orderRepository', () => new SequelizeOrderRepository());
  Container.register('portfolioRepository', () => new SequelizePortfolioRepository());
  Container.register('sellSnapshotRepository', () => new SequelizeOrderSellSnapshotRepository());
  Container.register('proventoRepository', () => new SequelizeProventoRepository());
}

function registerExternalServices(): void {
  Container.register('quoteProvider', () => new FundamentusQuoteProvider());
  Container.register('fundamentusScraper', () => new FundamentusScraperService());
  Container.register('spreadsheetParser', () => new SpreadsheetParserService());
  Container.register('excelExportService', () => new ExcelExportService());
}

function registerInfrastructure(): void {
  Container.register('transactionManager', () => new SequelizeTransactionManager());
}

function registerOrderServices(): void {
  Container.register('createOrderService', () => new CreateOrderService(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('sellSnapshotRepository'),
    Container.get('quoteProvider'),
    Container.get('transactionManager')
  ));

  Container.register('deleteOrderService', () => new DeleteOrderService(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('transactionManager')
  ));

  Container.register('listOrdersService', () => new ListOrdersService(
    Container.get('orderRepository')
  ));

  Container.register('importOrdersService', () => new ImportOrdersService(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('sellSnapshotRepository'),
    Container.get('quoteProvider'),
    Container.get('transactionManager')
  ));

  Container.register('getSellSnapshotsService', () => new GetSellSnapshotsService(
    Container.get('sellSnapshotRepository')
  ));

  Container.register('exportSellSnapshotsService', () => new ExportSellSnapshotsService(
    Container.get('sellSnapshotRepository'),
    Container.get('excelExportService')
  ));
}

function registerPortfolioServices(): void {
  Container.register('createOrUpdatePortfolioService', () => new CreateOrUpdatePortfolioService(
    Container.get('portfolioRepository')
  ));

  Container.register('deletePortfolioService', () => new DeletePortfolioService(
    Container.get('portfolioRepository')
  ));

  Container.register('listPortfolioService', () => new ListPortfolioService(
    Container.get('portfolioRepository')
  ));
}

function registerProventoServices(): void {
  Container.register('createProventoService', () => new CreateProventoService(
    Container.get('proventoRepository')
  ));

  Container.register('deleteProventoService', () => new DeleteProventoService(
    Container.get('proventoRepository')
  ));

  Container.register('importProventosService', () => new ImportProventosService(
    Container.get('proventoRepository'),
    Container.get('transactionManager')
  ));

  Container.register('listProventosService', () => new ListProventosService(
    Container.get('proventoRepository')
  ));
}
