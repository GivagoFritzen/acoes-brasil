import { CreateOrUpdatePortfolioService } from "./CreateOrUpdatePortfolioService";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { PortfolioEntity } from "../../domain/entities/PortfolioEntity";
import { ValidationError } from "../../shared/validators/OrderValidator";

describe("CreateOrUpdatePortfolioService", () => {
  let portfolioRepositoryMock: jest.Mocked<IPortfolioRepository>;
  let service: CreateOrUpdatePortfolioService;

  beforeEach(() => {
    portfolioRepositoryMock = {
      createAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findByCodigoAsync: jest.fn(),
      findAllAsync: jest.fn(),
      saveAsync: jest.fn(),
      deleteByCodigoAsync: jest.fn(),
    } as unknown as jest.Mocked<IPortfolioRepository>;

    service = new CreateOrUpdatePortfolioService(portfolioRepositoryMock);
  });

  it("Deve criar portfolio quando dados validos e nao existe", async () => {
    const portfolioCriado: PortfolioEntity = {
      id: "1",
      codigo: "VALE3",
      quantidade: 100,
      precoMedio: 50.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as PortfolioEntity;
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(null);
    portfolioRepositoryMock.createAsync.mockResolvedValue(portfolioCriado);

    const resultado = await service.executeAsync({
      codigo: "VALE3",
      quantidade: 100,
      precoMedio: 50.0,
    });

    expect(resultado.created).toBe(true);
    expect(portfolioRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve atualizar portfolio quando ja existe", async () => {
    const portfolioExistente: PortfolioEntity = {
      id: "1",
      codigo: "VALE3",
      quantidade: 100,
      precoMedio: 50.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      registerCompra: jest.fn(),
    } as unknown as PortfolioEntity;
    const portfolioAtualizado: PortfolioEntity = {
      ...portfolioExistente,
      quantidade: 200,
      precoMedio: 55.0,
    } as unknown as PortfolioEntity;
    portfolioRepositoryMock.findByCodigoAsync.mockResolvedValue(portfolioExistente);
    portfolioRepositoryMock.saveAsync.mockResolvedValue(portfolioAtualizado);

    const resultado = await service.executeAsync({
      codigo: "VALE3",
      quantidade: 100,
      precoMedio: 60.0,
    });

    expect(resultado.created).toBe(false);
    expect(portfolioRepositoryMock.saveAsync).toHaveBeenCalled();
  });

  it("Deve lancar erro quando codigo invalido", async () => {
    await expect(
      service.executeAsync({
        codigo: "",
        quantidade: 100,
        precoMedio: 50.0,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando quantidade invalida", async () => {
    await expect(
      service.executeAsync({
        codigo: "VALE3",
        quantidade: 0,
        precoMedio: 50.0,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando preco invalido", async () => {
    await expect(
      service.executeAsync({
        codigo: "VALE3",
        quantidade: 100,
        precoMedio: -1,
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando codigo NAO tem formato correto", async () => {
    await expect(
      service.executeAsync({
        codigo: "INVALID",
        quantidade: 100,
        precoMedio: 50.0,
      })
    ).rejects.toThrow(ValidationError);
  });
});