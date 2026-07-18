import { DeleteProventoService } from "./DeleteProventoService";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ProventoEntity } from "../../domain/entities/ProventoEntity";

describe("DeleteProventoService", () => {
  let proventoRepositoryMock: jest.Mocked<IProventoRepository>;
  let service: DeleteProventoService;

  beforeEach(() => {
    proventoRepositoryMock = {
      createAsync: jest.fn(),
      createManyAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as jest.Mocked<IProventoRepository>;

    service = new DeleteProventoService(proventoRepositoryMock);
  });

  it("Deve excluir provento quando existe", async () => {
    const provento = new ProventoEntity("1", "VALE3", "2024-01-01", "Dividendo", "Instituicao", 100, 1.0, 100.0);
    proventoRepositoryMock.findByIdAsync.mockResolvedValue(provento);

    await service.executeAsync("1");

    expect(proventoRepositoryMock.deleteAsync).toHaveBeenCalledWith("1");
  });

  it("Deve lancar erro quando provento nao existe", async () => {
    proventoRepositoryMock.findByIdAsync.mockResolvedValue(null);

    await expect(service.executeAsync("999")).rejects.toThrow("provento não encontrado.");
  });
});