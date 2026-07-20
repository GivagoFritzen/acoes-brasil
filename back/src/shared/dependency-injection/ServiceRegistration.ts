import { Container } from "./Container";
import { SequelizeOrderRepository } from "../../infrastructure/repositories/SequelizeOrderRepository";
import { SequelizePortfolioRepository } from "../../infrastructure/repositories/SequelizePortfolioRepository";
import { SequelizeOrderSellSnapshotRepository } from "../../infrastructure/repositories/SequelizeOrderSellSnapshotRepository";
import { SequelizeProventoRepository } from "../../infrastructure/repositories/SequelizeProventoRepository";
import { FundamentusQuoteProvider } from "../../infrastructure/services/FundamentusQuoteProvider";
import { FundamentusScraperService } from "../../infrastructure/services/FundamentusScraperService";
import { FundamentusProventosScraperService } from "../../infrastructure/services/FundamentusProventosScraperService";
import { GoogleFinanceService } from "../../infrastructure/services/GoogleFinanceService";
import { Investidor10ScraperService } from "../../infrastructure/services/Investidor10ScraperService";
import { YahooFinanceScraperService } from "../../infrastructure/services/YahooFinanceScraperService";
import { SpreadsheetParserService } from "../../infrastructure/services/SpreadsheetParserService";
import { ExcelExportService } from "../../infrastructure/services/ExcelExportService";
import { SequelizeTransactionManager } from "../../infrastructure/database/SequelizeTransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { CreateOrderService } from "../../application/services/CreateOrderService";
import { DeleteOrderService } from "../../application/services/DeleteOrderService";
import { ListOrdersService } from "../../application/services/ListOrdersService";
import { ImportOrdersService } from "../../application/services/ImportOrdersService";
import { GetSellSnapshotsService } from "../../application/services/GetSellSnapshotsService";
import { ExportSellSnapshotsService } from "../../application/services/ExportSellSnapshotsService";
import { CreateOrUpdatePortfolioService } from "../../application/services/CreateOrUpdatePortfolioService";
import { DeletePortfolioService } from "../../application/services/DeletePortfolioService";
import { ExportPortfolioService } from "../../application/services/ExportPortfolioService";
import { ImportPortfolioService } from "../../application/services/ImportPortfolioService";
import { ListPortfolioService } from "../../application/services/ListPortfolioService";
import { CreateProventoService } from "../../application/services/CreateProventoService";
import { DeleteProventoService } from "../../application/services/DeleteProventoService";
import { ImportProventosService } from "../../application/services/ImportProventosService";
import { ListProventosService } from "../../application/services/ListProventosService";
import { OrderController } from "../../controllers/OrderController";
import { PortfolioController } from "../../controllers/PortfolioController";
import { ProventoController } from "../../controllers/ProventoController";
import { ImportController } from "../../controllers/ImportController";

export function registerServices(): void {
  registerRepositories();
  registerExternalServices();
  registerInfrastructure();
  registerDomainServices();
  registerOrderServices();
  registerPortfolioServices();
  registerProventoServices();
  registerControllers();
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
  Container.register('fundamentusProventosScraper', () => new FundamentusProventosScraperService());
  Container.register('googleFinanceService', () => new GoogleFinanceService());
  Container.register('investidor10Scraper', () => new Investidor10ScraperService());
  Container.register('spreadsheetParser', () => new SpreadsheetParserService());
  Container.register('yahooFinanceScraper', () => new YahooFinanceScraperService());
  Container.register('ExcelExportService', () => new ExcelExportService());
}

function registerInfrastructure(): void {
  Container.register('transactionManager', () => new SequelizeTransactionManager());
}

function registerDomainServices(): void {
  Container.register('portfolioDomainService', () => new PortfolioDomainService());
}

function registerOrderServices(): void {
  Container.register('CreateOrderService', () => new CreateOrderService(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('sellSnapshotRepository'),
    Container.get('quoteProvider'),
    Container.get('transactionManager'),
    Container.get('portfolioDomainService')
  ));

  Container.register('DeleteOrderService', () => new DeleteOrderService(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('transactionManager'),
    Container.get('portfolioDomainService')
  ));

  Container.register('ListOrdersService', () => new ListOrdersService(
    Container.get('orderRepository')
  ));

  Container.register('ImportOrdersService', () => new ImportOrdersService(
    Container.get('orderRepository'),
    Container.get('portfolioRepository'),
    Container.get('sellSnapshotRepository'),
    Container.get('quoteProvider'),
    Container.get('transactionManager'),
    Container.get('portfolioDomainService')
  ));

  Container.register('GetSellSnapshotsService', () => new GetSellSnapshotsService(
    Container.get('sellSnapshotRepository')
  ));

  Container.register('ExportSellSnapshotsService', () => new ExportSellSnapshotsService(
    Container.get('sellSnapshotRepository'),
    Container.get('ExcelExportService')
  ));
}

function registerPortfolioServices(): void {
  Container.register('CreateOrUpdatePortfolioService', () => new CreateOrUpdatePortfolioService(
    Container.get('portfolioRepository')
  ));

  Container.register('DeletePortfolioService', () => new DeletePortfolioService(
    Container.get('portfolioRepository')
  ));

  Container.register('ListPortfolioService', () => new ListPortfolioService(
    Container.get('portfolioRepository')
  ));

  Container.register('ExportPortfolioService', () => new ExportPortfolioService(
    Container.get('portfolioRepository'),
    Container.get('ExcelExportService')
  ));

  Container.register('ImportPortfolioService', () => new ImportPortfolioService(
    Container.get('portfolioRepository'),
    Container.get('transactionManager')
  ));
}

function registerProventoServices(): void {
  Container.register('CreateProventoService', () => new CreateProventoService(
    Container.get('proventoRepository')
  ));

  Container.register('DeleteProventoService', () => new DeleteProventoService(
    Container.get('proventoRepository')
  ));

  Container.register('ImportProventosService', () => new ImportProventosService(
    Container.get('proventoRepository'),
    Container.get('transactionManager')
  ));

  Container.register('ListProventosService', () => new ListProventosService(
    Container.get('proventoRepository')
  ));
}

function registerControllers(): void {
  Container.register('OrderController', () => new OrderController(
    Container.get('CreateOrderService'),
    Container.get('DeleteOrderService'),
    Container.get('ListOrdersService'),
    Container.get('GetSellSnapshotsService'),
    Container.get('ExportSellSnapshotsService')
  ));

  Container.register('PortfolioController', () => new PortfolioController(
    Container.get('CreateOrUpdatePortfolioService'),
    Container.get('DeletePortfolioService'),
    Container.get('ListPortfolioService'),
    Container.get('ExportPortfolioService'),
    Container.get('ImportPortfolioService'),
    Container.get('spreadsheetParser')
  ));

  Container.register('ProventoController', () => new ProventoController(
    Container.get('CreateProventoService'),
    Container.get('DeleteProventoService'),
    Container.get('ImportProventosService'),
    Container.get('ListProventosService'),
    Container.get('spreadsheetParser')
  ));

  Container.register('ImportController', () => new ImportController(
    Container.get('ImportOrdersService'),
    Container.get('spreadsheetParser')
  ));
}
