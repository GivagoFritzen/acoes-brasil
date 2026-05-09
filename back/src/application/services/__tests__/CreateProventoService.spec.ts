import { CreateProventoService } from "../CreateProventoService";
import { IProventoRepository } from "../../domain/interfaces/IProventoRepository";
import { ProventoEntity } from "../../domain/entities/ProventoEntity";
import { ValidationError } from "../../shared/validators/OrderValidator";
import { ProventoTipo } from "../../../../common/models/provento/provento-tipo.model";

describe("CreateProventoService", () => {
  let proventoRepositoryMock: jest.Mocked<IProventoRepository>;
  let service: CreateProventoService;

  const tipoValido: ProventoTipo = "Dividendo";

  beforeEach(() => {
    proventoRepositoryMock = {
      createAsync: jest.fn(),
      createManyAsync: jest.fn(),
      findByIdAsync: jest.fn(),
      findAllAsync: jest.fn(),
      deleteAsync: jest.fn(),
    } as unknown as jest.Mocked<IProventoRepository>;

    service = new CreateProventoService(proventoRepositoryMock);
  });

  it("Deve criar provento quando dados validos", async () => {
    const proventoCriado: ProventoEntity = {
      id: "1",
      codigo: "VALE3",
      tipo: tipoValido,
      data: "2024-01-01",
      quantidade: 100,
      precoUnitario: 1.0,
      valorLiquido: 100.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ProventoEntity;
    proventoRepositoryMock.createAsync.mockResolvedValue(proventoCriado);

    const resultado = await service.executeAsync({
      codigo: "VALE3",
      tipo: tipoValido,
      data: "2024-01-01",
      quantidade: 100,
      precoUnitario: 1.0,
      valorLiquido: 100.0,
      instituicao: "Banco do Brasil",
    });

    expect(resultado).toBeDefined();
    expect(proventoRepositoryMock.createAsync).toHaveBeenCalled();
  });

  it("Deve lancar erro quando codigo invalido", async () => {
    await expect(
      service.executeAsync({
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
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);
    const dia = String(dataFutura.getDate()).padStart(2, "0");
    const mes = String(dataFutura.getMonth() + 1).padStart(2, "0");
    const ano = dataFutura.getFullYear();
    const dataStr = `${dia}-${mes}-${ano}`;

    await expect(
      service.executeAsync({
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
    await expect(
      service.executeAsync({
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