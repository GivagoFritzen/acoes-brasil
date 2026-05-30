import { Container } from "./Container";
import { registerServices } from "./ServiceRegistration";

describe("ServiceRegistration", () => {
  beforeEach(() => {
    Container.clear();
  });

  it("Deve registrar todos os servicos quando registerServices chamado", () => {
    registerServices();

    expect(() => Container.get("orderRepository")).not.toThrow();
    expect(() => Container.get("portfolioRepository")).not.toThrow();
    expect(() => Container.get("sellSnapshotRepository")).not.toThrow();
    expect(() => Container.get("proventoRepository")).not.toThrow();
    expect(() => Container.get("quoteProvider")).not.toThrow();
    expect(() => Container.get("fundamentusScraper")).not.toThrow();
    expect(() => Container.get("spreadsheetParser")).not.toThrow();
    expect(() => Container.get("ExcelExportService")).not.toThrow();
    expect(() => Container.get("transactionManager")).not.toThrow();
    expect(() => Container.get("portfolioDomainService")).not.toThrow();
  });

  it("Deve registrar servicos de order quando registerServices chamado", () => {
    registerServices();

    expect(() => Container.get("CreateOrderService")).not.toThrow();
    expect(() => Container.get("DeleteOrderService")).not.toThrow();
    expect(() => Container.get("ListOrdersService")).not.toThrow();
    expect(() => Container.get("ImportOrdersService")).not.toThrow();
    expect(() => Container.get("GetSellSnapshotsService")).not.toThrow();
    expect(() => Container.get("ExportSellSnapshotsService")).not.toThrow();
  });

  it("Deve registrar servicos de portfolio quando registerServices chamado", () => {
    registerServices();

    expect(() => Container.get("CreateOrUpdatePortfolioService")).not.toThrow();
    expect(() => Container.get("DeletePortfolioService")).not.toThrow();
    expect(() => Container.get("ListPortfolioService")).not.toThrow();
  });

  it("Deve registrar servicos de provento quando registerServices chamado", () => {
    registerServices();

    expect(() => Container.get("CreateProventoService")).not.toThrow();
    expect(() => Container.get("DeleteProventoService")).not.toThrow();
    expect(() => Container.get("ImportProventosService")).not.toThrow();
    expect(() => Container.get("ListProventosService")).not.toThrow();
  });
});
