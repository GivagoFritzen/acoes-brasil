import { Container } from "./Container";

describe("Container", () => {
  beforeEach(() => {
    Container.clear();
  });

  it("Deve registrar e resolver servico quando factory fornecida", () => {
    Container.register("testeService", () => ({ foo: "bar" }));

    const resultado = Container.get<{ foo: string }>("testeService");

    expect(resultado).toEqual({ foo: "bar" });
  });

  it("Deve retornar mesma instancia quando servico ja resolvido", () => {
    Container.register("singletonService", () => ({ contador: 0 }));

    const instancia1 = Container.get<{ contador: number }>("singletonService");
    instancia1.contador = 1;
    const instancia2 = Container.get<{ contador: number }>("singletonService");

    expect(instancia2.contador).toBe(1);
  });

  it("Deve lancar erro quando servico nao registrado", () => {
    expect(() => Container.get("servicoInexistente")).toThrow(
      "Service servicoInexistente not registered"
    );
  });

  it("Deve limpar todos os registros quando clear chamado", () => {
    Container.register("servicoA", () => ({ nome: "A" }));
    Container.get("servicoA");

    Container.clear();

    expect(() => Container.get("servicoA")).toThrow(
      "Service servicoA not registered"
    );
  });

  it("Deve permitir multiplos registros independentes", () => {
    Container.register("servicoA", () => ({ valor: 1 }));
    Container.register("servicoB", () => ({ valor: 2 }));

    expect(Container.get<{ valor: number }>("servicoA").valor).toBe(1);
    expect(Container.get<{ valor: number }>("servicoB").valor).toBe(2);
  });
});
