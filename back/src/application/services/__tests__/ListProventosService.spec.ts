import { ListProventosService } from "../ListProventosService";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { IProventoFilters } from "../../domain/interfaces/IProventoFilters";
import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { ProventoTipo } from "../../../../common/models/provento/provento-tipo.model";

describe("ListProventosService", () => {
  let proventoRepositoryMock: jest.Mocked<IProventoRepository>;
  let service: ListProventosService;

  beforeEach(() => {
    proventoRepositoryMock = {
      createAsync: jest.fn(),
      createManyAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IProventoRepository>;

    service = new ListProventosService(proventoRepositoryMock);
  });

  it("Deve retornar resultado paginado quando filtros vazios", async () => {
    const resultadoFake = {
      rows: [] as ProventoEntity[],
      count: 0,
    };
    proventoRepositoryMock.findAllAsync.mockResolvedValue(resultadoFake);

    const resultado = await service.executeAsync({});

    expect(resultado.page).toBe(1);
    expect(resultado.limit).toBe(20);
    expect(resultado.total).toBe(0);
  });

  it("Deve normalizar pagina e limite para minimo 1", async () => {
    const resultadoFake = {
      rows: [] as ProventoEntity[],
      count: 0,
    };
    proventoRepositoryMock.findAllAsync.mockResolvedValue(resultadoFake);

    await service.executeAsync({ page: 0, limit: 0 });

    expect(proventoRepositoryMock.findAllAsync).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 1 })
    );
  });

  it("Deve retornar dados quando repository retorna proventos", async () => {
    const proventosFakes: ProventoEntity[] = [
      { id: "1", codigo: "VALE3", tipo: "Dividendo" as ProventoTipo, data: "2024-01-01", valor: 100.0, createdAt: new Date(), updatedAt: new Date() },
    ] as unknown as ProventoEntity[];
    const resultadoFake = {
      rows: proventosFakes,
      count: 1,
    };
    proventoRepositoryMock.findAllAsync.mockResolvedValue(resultadoFake);

    const resultado = await service.executeAsync({});

    expect(resultado.data).toHaveLength(1);
    expect(resultado.total).toBe(1);
  });

  it("Deve calcular totalPages corretamente", async () => {
    const resultadoFake = {
      rows: [] as ProventoEntity[],
      count: 50,
    };
    proventoRepositoryMock.findAllAsync.mockResolvedValue(resultadoFake);

    const resultado = await service.executeAsync({ page: 1, limit: 10 });

    expect(resultado.totalPages).toBe(5);
  });
});