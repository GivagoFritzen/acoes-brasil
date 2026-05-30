import { DeletePortfolioService } from "./DeletePortfolioService";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";

describe("DeletePortfolioService", () => {
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let service: DeletePortfolioService;

  beforeEach(() => {
    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as unknown as jest.Mocked<IPortfolioRepository>;

    service = new DeletePortfolioService(portfolioRepositoryMock);
  });

  it("Deve excluir portfolio quando existe", async () => {
    const portfolio: PortfolioEntity = {
      id: "1",
      codigo: "VALE3",
      quantidade: 100,
      precoMedio: 50.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as PortfolioEntity;
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(portfolio);

    await service.executeAsync("1");

    expect(portfolioRepositoryMock.deleteByCodigoAsync).toHaveBeenCalledWith("VALE3");
  });

  it("Deve lancar erro quando portfolio nao existe", async () => {
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(null);

    await expect(service.executeAsync("999")).rejects.toThrow("Ativo do portfólio não encontrado.");
  });
});