import { UpdatePortfolioService } from "./UpdatePortfolioService";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { ValidationError } from "../../shared/exceptions/ValidationError";

describe("UpdatePortfolioService", () => {
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let service: UpdatePortfolioService;

  beforeEach(() => {
    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as jest.Mocked<IPortfolioRepository>;

    service = new UpdatePortfolioService(portfolioRepositoryMock);
  });

  it("Deve atualizar portfolio quando dados validos", async () => {
    const portfolioExistente = new PortfolioEntity("1", "VALE3", 100, 50.0);
    const portfolioAtualizado = new PortfolioEntity("1", "VALE3", 200, 55.0);
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(portfolioExistente);
    portfolioRepositoryMock.saveAsync.mockResolvedValue(portfolioAtualizado);

    const resultado = await service.executeAsync("1", {
      codigo: "VALE3",
      quantidade: 200,
      precoMedio: 55.0,
    });

    expect(resultado.codigo).toBe("VALE3");
    expect(resultado.quantidade).toBe(200);
    expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalled();
  });

  it("Deve lancar erro quando portfolio nao existe", async () => {
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(null);

    await expect(
      service.executeAsync("999", {
        codigo: "VALE3",
        quantidade: 100,
        precoMedio: 50.0,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando codigo invalido", async () => {
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 100, 50.0));

    await expect(
      service.executeAsync("1", {
        codigo: "",
        quantidade: 100,
        precoMedio: 50.0,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando quantidade invalida", async () => {
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 100, 50.0));

    await expect(
      service.executeAsync("1", {
        codigo: "VALE3",
        quantidade: 0,
        precoMedio: 50.0,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando preco invalido", async () => {
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 100, 50.0));

    await expect(
      service.executeAsync("1", {
        codigo: "VALE3",
        quantidade: 100,
        precoMedio: -1,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando codigo NAO tem formato correto", async () => {
    portfolioRepositoryMock.findByIdAsync.mockResolvedValue(new PortfolioEntity("1", "VALE3", 100, 50.0));

    await expect(
      service.executeAsync("1", {
        codigo: "INVALID",
        quantidade: 100,
        precoMedio: 50.0,
      })
    ).rejects.toThrow(ValidationError);
  });
});