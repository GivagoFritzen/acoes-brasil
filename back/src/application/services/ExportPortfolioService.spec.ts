import { ExportPortfolioService } from "./ExportPortfolioService";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ExcelExportService } from "../../infrastructure/services/ExcelExportService";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";

describe("ExportPortfolioService", () => {
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let excelExportServiceMock: jest.Mocked<ExcelExportService>;
  let service: ExportPortfolioService;

  beforeEach(() => {
    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as unknown as jest.Mocked<IPortfolioRepository>;

    excelExportServiceMock = {
      generateAsync: jest.fn(),
    } as unknown as jest.Mocked<ExcelExportService>;

    service = new ExportPortfolioService(portfolioRepositoryMock, excelExportServiceMock);
  });

  it("Deve exportar portfolio quando existem ativos", async () => {
    const ativos = [
      new PortfolioEntity("1", "VALE3", 100, 50.0),
      new PortfolioEntity("2", "PETR4", 200, 30.0),
    ];
    portfolioRepositoryMock.findAllAsync.mockResolvedValue(ativos);
    excelExportServiceMock.generateAsync.mockReturnValue(Buffer.from("test"));

    const resultado = await service.executeAsync();

    expect(resultado.buffer).toBeDefined();
    expect(resultado.fileName).toContain("portfolio");
  });

  it("Deve calcular valorTotal como quantidade vezes precoMedio", async () => {
    const ativos = [
      new PortfolioEntity("1", "VALE3", 100, 50.0),
      new PortfolioEntity("2", "PETR4", 200, 30.0),
    ];
    portfolioRepositoryMock.findAllAsync.mockResolvedValue(ativos);
    excelExportServiceMock.generateAsync.mockReturnValue(Buffer.from("test"));

    await service.executeAsync();

    const rows = excelExportServiceMock.generateAsync.mock.calls[0][0];
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      Código: "VALE3",
      Quantidade: 100,
      "Preço Médio": 50.0,
      "Valor Total": 5000,
    });
    expect(rows[1]).toMatchObject({
      Código: "PETR4",
      Quantidade: 200,
      "Preço Médio": 30.0,
      "Valor Total": 6000,
    });
  });

  it("Deve exportar com sheetName Portfolio", async () => {
    portfolioRepositoryMock.findAllAsync.mockResolvedValue([]);
    excelExportServiceMock.generateAsync.mockReturnValue(Buffer.from("test"));

    await service.executeAsync();

    expect(excelExportServiceMock.generateAsync).toHaveBeenCalledWith([], "Portfolio");
  });

  it("Deve retornar lista vazia quando portfolio vazio", async () => {
    portfolioRepositoryMock.findAllAsync.mockResolvedValue([]);
    excelExportServiceMock.generateAsync.mockReturnValue(Buffer.from("test"));

    const resultado = await service.executeAsync();

    expect(resultado.buffer).toBeDefined();
    const rows = excelExportServiceMock.generateAsync.mock.calls[0][0];
    expect(rows).toHaveLength(0);
  });

  it("Deve gerar nome de arquivo com prefixo portfolio", async () => {
    portfolioRepositoryMock.findAllAsync.mockResolvedValue([]);
    excelExportServiceMock.generateAsync.mockReturnValue(Buffer.from("test"));

    const resultado = await service.executeAsync();

    expect(resultado.fileName).toMatch(/^portfolio-\d{8}\.xlsx$/);
  });
});
