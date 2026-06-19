import { TradingHoursCalculator } from './TradingHoursCalculator';

const openTime = '10:00';
const closeTime = '18:00';
const tradingDays = [1, 2, 3, 4, 5];
const timezone = 'America/Sao_Paulo';

describe('TradingHoursCalculator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Deve_retornar_true_quando_mercado_estiver_aberto', () => {
    it('deve retornar true durante horario de negociacao em dia util', () => {
      vi.setSystemTime(new Date('2026-06-17T14:30:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, [],
      );

      expect(result).toBe(true);
    });

    it('deve retornar true exatamente no horario de abertura', () => {
      vi.setSystemTime(new Date('2026-06-17T10:00:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, [],
      );

      expect(result).toBe(true);
    });
  });

  describe('Deve_retornar_false_quando_mercado_estiver_fechado', () => {
    it('deve retornar false antes do horario de abertura', () => {
      vi.setSystemTime(new Date('2026-06-17T09:30:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, [],
      );

      expect(result).toBe(false);
    });

    it('deve retornar false apos o horario de fechamento', () => {
      vi.setSystemTime(new Date('2026-06-17T18:30:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, [],
      );

      expect(result).toBe(false);
    });

    it('deve retornar false exatamente no horario de fechamento', () => {
      vi.setSystemTime(new Date('2026-06-17T18:00:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, [],
      );

      expect(result).toBe(false);
    });
  });

  describe('Deve_retornar_false_quando_for_fim_de_semana', () => {
    it('deve retornar false no sabado durante horario de negociacao', () => {
      vi.setSystemTime(new Date('2026-06-20T14:30:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, [],
      );

      expect(result).toBe(false);
    });

    it('deve retornar false no domingo', () => {
      vi.setSystemTime(new Date('2026-06-21T14:30:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, [],
      );

      expect(result).toBe(false);
    });
  });

  describe('Deve_retornar_false_quando_for_feriado', () => {
    it('deve retornar false em dia de feriado incluso na lista', () => {
      const holidays = ['2026-06-17'];
      vi.setSystemTime(new Date('2026-06-17T14:30:00-03:00'));

      const result = TradingHoursCalculator.calculate(
        openTime, closeTime, tradingDays, timezone, holidays,
      );

      expect(result).toBe(false);
    });
  });
});
