import { ImportPortfolioService } from "./ImportPortfolioService";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { PortfolioImportRowDto } from "../dto/PortfolioImportRowDto";

describe("ImportPortfolioService", () => {
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let transactionManagerMock: jest.Mocked<ITransactionManager>;
  let service: ImportPortfolioService;

  beforeEach(() => {
    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as jest.Mocked<IPortfolioRepository>;

    transactionManagerMock = {
      executeAsync: jest.fn((fn) => fn(undefined)),
    } as jest.Mocked<ITransactionManager>;

    service = new ImportPortfolioService(portfolioRepositoryMock, transactionManagerMock);
  });

  it("Deve importar linhas quando dados validos", async () => {
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

    const rows: PortfolioImportRowDto[] = [
      { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 },
      { codigo: "PETR4", quantidade: 200, precoMedio: 30.0 },
    ];

    const resultado = await service.executeAsync(rows);

    expect(resultado).toBe(2);
  });

  it("Deve criar portfolio quando ativo nao existe", async () => {
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

    const rows: PortfolioImportRowDto[] = [
      { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 },
    ];

    await service.executeAsync(rows);

    expect(portfolioRepositoryMock.createAsync).toHaveBeenCalledWith(
      { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 },
      undefined
    );
    expect(portfolioRepositoryMock.saveAsync).not.toHaveBeenCalled();
  });

  it("Deve atualizar portfolio quando ativo ja existe", async () => {
    const existing = new PortfolioEntity("1", "VALE3", 50, 40.0);
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(existing);

    const rows: PortfolioImportRowDto[] = [
      { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 },
    ];

    await service.executeAsync(rows);

    expect(existing.quantidade).toBe(100);
    expect(existing.precoMedio).toBe(50.0);
    expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalledWith(existing, undefined);
    expect(portfolioRepositoryMock.createAsync).not.toHaveBeenCalled();
  });

  it("Deve lancar erro quando array vazio", async () => {
    await expect(service.executeAsync([])).rejects.toThrow("Nenhuma linha para importar.");
  });

  it("Deve usar transactionManager para agrupar operacoes", async () => {
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);

    const rows: PortfolioImportRowDto[] = [
      { codigo: "VALE3", quantidade: 100, precoMedio: 50.0 },
    ];

    await service.executeAsync(rows);

    expect(transactionManagerMock.executeAsync).toHaveBeenCalled();
  });
});
