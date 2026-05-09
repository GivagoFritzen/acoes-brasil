import { ImportProventosService } from "../ImportProventosService";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { CreateProventoDto } from "../dto/CreateProventoDto";

describe("ImportProventosService", () => {
  let proventoRepositoryMock: jest.Mocked<IProventoRepository>;
  let transactionManagerMock: jest.Mocked<ITransactionManager>;
  let service: ImportProventosService;

  beforeEach(() => {
    proventoRepositoryMock = {
      createAsync: jest.fn().mockResolvedValue({} as any),
      createManyAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IProventoRepository>;

    transactionManagerMock = {
      executeAsync: jest.fn((fn) => fn(undefined)),
    } as unknown as jest.Mocked<ITransactionManager>;

    service = new ImportProventosService(proventoRepositoryMock, transactionManagerMock);
  });

  it("Deve importar proventos quando dados validos", async () => {
    const linhas: CreateProventoDto[] = [
      { codigo: "VALE3", tipo: "Juros", data: "2024-01-01", quantidade: 100, precoUnitario: 1.0, valorLiquido: 100.0, instituicao: "Banco do Brasil" },
    ];

    const resultado = await service.executeAsync(linhas);

    expect(resultado.imported).toBe(1);
    expect(proventoRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve pular linhas invalidas", async () => {
    const linhas: CreateProventoDto[] = [
      { codigo: "VALE3", tipo: "Juros", data: "2024-01-01", quantidade: 100, precoUnitario: 1.0, valorLiquido: 100.0, instituicao: "Banco do Brasil" },
      { codigo: "INVALID", tipo: "Juros", data: "2024-01-01", quantidade: 100, precoUnitario: 1.0, valorLiquido: 100.0, instituicao: "Banco do Brasil" },
    ];

    const resultado = await service.executeAsync(linhas);

    expect(resultado.skipped).toBe(1);
  });

  it("Deve lancarr erro quando nenhuma linha valida", async () => {
    const linhas: CreateProventoDto[] = [
      { codigo: "INVALID", tipo: "Juros", data: "2024-01-01", quantidade: 100, precoUnitario: 1.0, valorLiquido: 100.0, instituicao: "Banco do Brasil" },
    ];

    await expect(service.executeAsync(linhas)).rejects.toThrow();
  });
});