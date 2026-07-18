import { TradingHoursScraperService } from "./TradingHoursScraperService";
import type { TradingHoursServiceTest } from "../../models/TradingHoursServiceTest";

const mockHtmlOpen = `
<html>
<body>
<span>B3 is open Mon-Fri, 10:00 - 16:55</span>
<meta name="timezone" content="America/Sao_Paulo" />
<script>let status: 'Open';</script>
</body>
</html>
`;

const mockHtmlClosed = `
<html>
<body>
<span>B3 is closed</span>
<meta name="timezone" content="America/Sao_Paulo" />
<script>let status: 'Closed';</script>
</body>
</html>
`;

describe("TradingHoursScraperService", () => {
  let service: TradingHoursScraperService;

  beforeEach(() => {
    service = new TradingHoursScraperService();
    jest.restoreAllMocks();
  });

  describe("parseHtml", () => {
    it("deve extrair openTime e closeTime do HTML", () => {
      const result = (service as TradingHoursServiceTest).parseHtml(mockHtmlOpen);

      expect(result.openTime).toBe("10:00");
      expect(result.closeTime).toBe("16:55");
    });

    it("deve extrair status Open do HTML", () => {
      const result = (service as TradingHoursServiceTest).parseHtml(mockHtmlOpen);

      expect(result.isOpen).toBe(true);
    });

    it("deve extrair status Closed do HTML", () => {
      const result = (service as TradingHoursServiceTest).parseHtml(mockHtmlClosed);

      expect(result.isOpen).toBe(false);
    });

    it("deve extrair timezone America/Sao_Paulo do HTML", () => {
      const result = (service as TradingHoursServiceTest).parseHtml(mockHtmlOpen);

      expect(result.timezone).toBe("America/Sao_Paulo");
    });

    it("deve retornar tradingDays [1,2,3,4,5]", () => {
      const result = (service as TradingHoursServiceTest).parseHtml(mockHtmlOpen);

      expect(result.tradingDays).toEqual([1, 2, 3, 4, 5]);
    });

    it("deve usar valores default quando HTML nao tem dados", () => {
      const result = (service as TradingHoursServiceTest).parseHtml("<html></html>");

      expect(result.openTime).toBe("10:00");
      expect(result.closeTime).toBe("16:55");
      expect(result.isOpen).toBe(false);
      expect(result.timezone).toBe("America/Sao_Paulo");
    });
  });

  describe("extractStatus", () => {
    it("deve extrair Open do script", () => {
      const result = (service as TradingHoursServiceTest).extractStatus(mockHtmlOpen);

      expect(result).toBe("Open");
    });

    it("deve extrair Closed do script", () => {
      const result = (service as TradingHoursServiceTest).extractStatus(mockHtmlClosed);

      expect(result).toBe("Closed");
    });

    it("deve retornar null quando nao achar status", () => {
      const result = (service as TradingHoursServiceTest).extractStatus("<html></html>");

      expect(result).toBeNull();
    });
  });

  describe("extractHoursText", () => {
    it("deve extrair texto de horario do HTML", () => {
      const result = (service as TradingHoursServiceTest).extractHoursText(mockHtmlOpen);

      expect(result).toContain("Mon-Fri");
      expect(result).toContain("10:00");
      expect(result).toContain("16:55");
    });

    it("deve retornar null quando nao achar horario", () => {
      const result = (service as TradingHoursServiceTest).extractHoursText("<html></html>");

      expect(result).toBeNull();
    });
  });

  describe("parseHoursFromText", () => {
    it("deve extrair horarios do texto", () => {
      const result = (service as TradingHoursServiceTest).parseHoursFromText("Mon-Fri, 10:00 - 16:55");

      expect(result).toEqual({ openTime: "10:00", closeTime: "16:55" });
    });

    it("deve retornar null para texto sem horario", () => {
      const result = (service as TradingHoursServiceTest).parseHoursFromText("texto qualquer");

      expect(result).toBeNull();
    });
  });

  describe("scrapeAsync", () => {
    it("deve retornar dados default quando fetch falha", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      const result = await service.scrapeAsync();

      expect(result.openTime).toBe("10:00");
      expect(result.closeTime).toBe("16:55");
      expect(result.isOpen).toBe(false);
    });

    it("deve retornar dados default quando status nao e ok", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: jest.fn(),
      });

      const result = await service.scrapeAsync();

      expect(result.openTime).toBe("10:00");
      expect(result.isOpen).toBe(false);
    });
  });
});
