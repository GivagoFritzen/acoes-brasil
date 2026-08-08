import { UpdateProventoService } from "./UpdateProventoService";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { ValidationError } from "../../shared/exceptions/ValidationError";
import { NotFoundException } from "../../shared/exceptions/NotFoundException";
import { ProventoTipo as proventoTipo } from "../../../../common/models/provento/ProventoTipoModel";

describe("UpdateProventoService", () => {
  let proventoRepositoryMock: jest.Mocked<IProventoRepository>;
  let service: UpdateProventoService;

  const tipoValido: proventoTipo = "Dividendo";

  beforeEach(() => {
    proventoRepositoryMock = {
      createAsync: jest.fn(),
      createManyAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as jest.Mocked<IProventoRepository>;

    service = new UpdateProventoService(proventoRepositoryMock);
  });

  it("Deve atualizar provento quando dados validos", async () => {
    const proventoExistente = new ProventoEntity("1", "VALE3", "2024-01-01", tipoValido, "Banco do Brasil", 100, 1.0, 100.0);
    const proventoAtualizado = new ProventoEntity("2", "VALE3", "2024-01-15", tipoValido, "Banco do Brasil", 200, 1.5, 300.0);
    proventoRepositoryMock.findByIdAsync.mockResolvedValue(proventoExistente);
    proventoRepositoryMock.deleteAsync.mockResolvedValue(undefined);
    proventoRepositoryMock.createAsync.mockResolvedValue(proventoAtualizado);

    const resultado = await service.executeAsync("1", {
      codigo: "VALE3",
      tipo: tipoValido,
      data: "2024-01-15",
      quantidade: 200,
      precoUnitario: 1.5,
      valorLiquido: 300.0,
      instituicao: "Banco do Brasil",
    });

    expect(resultado).toBeDefined();
    expect(proventoRepositoryMock.deleteAsync).toHaveBeenCalled();
    expect(proventoRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve lancar erro quando provento nao existe", async () => {
    proventoRepositoryMock.findByIdAsync.mockResolvedValue(null);

    await expect(
      service.executeAsync("999", {
        codigo: "VALE3",
        tipo: tipoValido,
        data: "2024-01-01",
        quantidade: 100,
        precoUnitario: 1.0,
        valorLiquido: 100.0,
        instituicao: "Banco do Brasil",
      })
    ).rejects.toThrow(NotFoundException);
  });

  it("Deve lancar erro quando codigo invalido", async () => {
    proventoRepositoryMock.findByIdAsync.mockResolvedValue(new ProventoEntity("1", "VALE3", "2024-01-01", tipoValido, "Banco do Brasil", 100, 1.0, 100.0));

    await expect(
      service.executeAsync("1", {
        codigo: "",
        tipo: tipoValido,
        data: "2024-01-01",
        quantidade: 100,
        precoUnitario: 1.0,
        valorLiquido: 100.0,
        instituicao: "Banco do Brasil",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando data futura", async () => {
    proventoRepositoryMock.findByIdAsync.mockResolvedValue(new ProventoEntity("1", "VALE3", "2024-01-01", tipoValido, "Banco do Brasil", 100, 1.0, 100.0));
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);
    const dia = String(dataFutura.getDate()).padStart(2, "0");
    const mes = String(dataFutura.getMonth() + 1).padStart(2, "0");
    const ano = dataFutura.getFullYear();
    const dataStr = `${dia}-${mes}-${ano}`;

    await expect(
      service.executeAsync("1", {
        codigo: "VALE3",
        tipo: tipoValido,
        data: dataStr,
        quantidade: 100,
        precoUnitario: 1.0,
        valorLiquido: 100.0,
        instituicao: "Banco do Brasil",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("Deve lancar erro quando codigo NAO tem formato correto", async () => {
    proventoRepositoryMock.findByIdAsync.mockResolvedValue(new ProventoEntity("1", "VALE3", "2024-01-01", tipoValido, "Banco do Brasil", 100, 1.0, 100.0));

    await expect(
      service.executeAsync("1", {
        codigo: "INVALID",
        tipo: tipoValido,
        data: "2024-01-01",
        quantidade: 100,
        precoUnitario: 1.0,
        valorLiquido: 100.0,
        instituicao: "Banco do Brasil",
      })
    ).rejects.toThrow(ValidationError);
  });
});