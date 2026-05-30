import {
  normalizeCodigoForFundamentus,
  decodeHtmlEntities,
  stripHtml,
} from "./FundamentusUtils";

describe("FundamentusUtils", () => {
  describe("normalizeCodigoForFundamentus", () => {
    it("Deve remover sufixo F quando codigo tiver 6 caracteres e terminar com F", () => {
      expect(normalizeCodigoForFundamentus("MULT3F")).toBe("MULT3");
    });

    it("Deve retornar codigo normalizado quando nao terminar com F", () => {
      expect(normalizeCodigoForFundamentus(" vale3 ")).toBe("VALE3");
    });

    it("Deve retornar codigo em maiusculo sem espacos", () => {
      expect(normalizeCodigoForFundamentus("  petr4  ")).toBe("PETR4");
    });
  });

  describe("decodeHtmlEntities", () => {
    it("Deve decodificar &nbsp; para espaco", () => {
      expect(decodeHtmlEntities("texto&nbsp;teste")).toBe("texto teste");
    });

    it("Deve decodificar &amp; para &", () => {
      expect(decodeHtmlEntities("a&amp;b")).toBe("a&b");
    });

    it("Deve decodificar &quot; para aspas duplas", () => {
      expect(decodeHtmlEntities("&quot;texto&quot;")).toBe('"texto"');
    });

    it("Deve decodificar &#39; para aspas simples", () => {
      expect(decodeHtmlEntities("&#39;texto&#39;")).toBe("'texto'");
    });

    it("Deve decodificar &lt; e &gt; para maior e menor", () => {
      expect(decodeHtmlEntities("a&lt;b&gt;c")).toBe("a<b>c");
    });

    it("Deve decodificar entidades numericas", () => {
      expect(decodeHtmlEntities("&#65;&#66;&#67;")).toBe("ABC");
    });
  });

  describe("stripHtml", () => {
    it("Deve remover tags HTML simples", () => {
      expect(stripHtml("<div>texto</div>")).toBe("texto");
    });

    it("Deve remover tags HTML e decodificar entidades", () => {
      expect(stripHtml("<p>valor&nbsp;&gt;10</p>")).toBe("valor 10");
    });

    it("Deve remover multiplas tags e normalizar espacos", () => {
      expect(stripHtml("<span>um</span> <span>dois</span>")).toBe("um dois");
    });

    it("Deve retornar string vazia quando so tags", () => {
      expect(stripHtml("<br/>")).toBe("");
    });

    it("Deve retornar string sem alteracao quando sem tags", () => {
      expect(stripHtml("texto simples")).toBe("texto simples");
    });
  });
});
