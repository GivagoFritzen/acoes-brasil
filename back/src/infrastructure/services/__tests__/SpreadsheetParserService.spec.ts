import { SpreadsheetParserService } from "../SpreadsheetParserService";

describe("SpreadsheetParserService", () => {
  let service: SpreadsheetParserService;

  beforeEach(() => {
    service = new SpreadsheetParserService();
  });

  it("Deve retornar array vazio quando buffer vazio", () => {
    const buffer = Buffer.from([]);

    const resultado = service.parseOrderRowsAsync(buffer);

    expect(resultado).toEqual([]);
  });
});