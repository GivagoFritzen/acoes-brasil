import { Container } from "./Container";
import { SequelizeOrderRepository } from "../../infrastructure/repositories/SequelizeOrderRepository";
import { SequelizePortfolioRepository } from "../../infrastructure/repositories/SequelizePortfolioRepository";
import { SequelizeOrderSellSnapshotRepository } from "../../infrastructure/repositories/SequelizeOrderSellSnapshotRepository";
import { FundamentusQuoteProvider } from "../../infrastructure/services/FundamentusQuoteProvider";
import { SequelizeTransactionManager } from "../../infrastructure/database/SequelizeTransactionManager";
import { CreateOrderUseCase } from "../../application/use-cases/CreateOrderUseCase";
import { DeleteOrderUseCase } from "../../application/use-cases/DeleteOrderUseCase";
import { ListOrdersUseCase } from "../../application/use-cases/ListOrdersUseCase";
import { CreateOrUpdatePortfolioUseCase } from "../../application/use-cases/CreateOrUpdatePortfolioUseCase";
import { DeletePortfolioUseCase } from "../../application/use-cases/DeletePortfolioUseCase";
import { ListPortfolioUseCase } from "../../application/use-cases/ListPortfolioUseCase";

export function registerServices(): void {
  // Repositories
  Container.register('orderRepository', () => new SequelizeOrderRepository());
  Container.register('portfolioRepository', () => new SequelizePortfolioRepository());
  Container.register('sellSnapshotRepository', () => new SequelizeOrderSellSnapshotRepository());

  // External Services
  Container.register('quoteProvider', () => new FundamentusQuoteProvider());

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
}
