import { ListPortfolioService } from "./ListPortfolioService";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";

describe("ListPortfolioService", () => {
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let service: ListPortfolioService;

  beforeEach(() => {
    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as jest.Mocked<IPortfolioRepository>;

    service = new ListPortfolioService(portfolioRepositoryMock);
  });

  it("Deve retornar lista vazia quando repository retorna array vazio", async () => {
    portfolioRepositoryMock.findAllAsync.mockResolvedValue([]);

    const resultado = await service.executeAsync();

    expect(resultado).toEqual([]);
    expect(portfolioRepositoryMock.findAllAsync).toHaveBeenCalledTimes(1);
  });

  it("Deve retornar lista de portfolios quando repository retorna dados", async () => {
    const portfoliosFakes: PortfolioEntity[] = [
      new PortfolioEntity("1", "VALE3", 100, 50.0),
      new PortfolioEntity("2", "PETR4", 200, 30.0),
    ];
    portfolioRepositoryMock.findAllAsync.mockResolvedValue(portfoliosFakes);

    const resultado = await service.executeAsync();

    expect(resultado).toHaveLength(2);
    expect(portfolioRepositoryMock.findAllAsync).toHaveBeenCalledTimes(1);
  });
});