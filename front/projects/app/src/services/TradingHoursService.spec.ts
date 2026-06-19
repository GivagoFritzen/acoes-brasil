import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { TradingHoursService } from './TradingHoursService';

describe('TradingHoursService', () => {
  let service: TradingHoursService;
  let mockHttp: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockHttp = { get: vi.fn() };
    service = new TradingHoursService(mockHttp as unknown as HttpClient);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createApiResponse = (isOpen: boolean) => ({
    success: true,
    data: {
      id: 'bvmf',
      name: 'B3',
      shortName: 'B3',
      country: 'BR',
      region: 'BR',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      marketCap: '1T',
      location: 'Sao Paulo',
      website: 'https://www.b3.com.br',
      openTime: '10:00',
      closeTime: '16:55',
      isOpen,
      holidays: [],
      tradingDays: [1, 2, 3, 4, 5],
      nextOpenTime: '',
      currentStatus: {
        marketId: 'bvmf',
        isOpen,
        status: isOpen ? 'open' : 'closed',
        nextChange: '',
        localTime: '',
        marketTime: '',
      },
      upcomingHolidays: [],
    },
  });

  describe('getBvmfTradingHours', () => {
    it('deve fazer GET para o backend local', () => {
      mockHttp.get.mockReturnValue(of(createApiResponse(false)));

      service.getBvmfTradingHours().subscribe();

      expect(mockHttp.get).toHaveBeenCalledWith('http://localhost:3000/trading-hours');
    });

    it('deve usar calculo local de isOpen sobrepondo valor da API', async () => {
      vi.setSystemTime(new Date('2026-06-17T14:30:00-03:00'));
      mockHttp.get.mockReturnValue(of(createApiResponse(false)));

      const response = await firstValueFrom(service.getBvmfTradingHours());

      expect(response.data.isOpen).toBe(true);
    });

    it('deve retornar isOpen false quando API retorna sucesso mas mercado esta fechado', async () => {
      vi.setSystemTime(new Date('2026-06-17T09:30:00-03:00'));
      mockHttp.get.mockReturnValue(of(createApiResponse(true)));

      const response = await firstValueFrom(service.getBvmfTradingHours());

      expect(response.data.isOpen).toBe(false);
    });

    it('deve retornar fallback com calculo local quando API retorna erro', async () => {
      vi.setSystemTime(new Date('2026-06-17T14:30:00-03:00'));
      mockHttp.get.mockReturnValue(throwError(() => new Error('Erro interno')));

      const response = await firstValueFrom(service.getBvmfTradingHours());

      expect(response.success).toBe(false);
      expect(response.data.isOpen).toBe(true);
      expect(response.data.name).toBe('B3');
    });

    it('deve retornar fallback com isOpen false quando mercado estiver fechado e API falha', async () => {
      vi.setSystemTime(new Date('2026-06-17T09:30:00-03:00'));
      mockHttp.get.mockReturnValue(throwError(() => new Error('Not found')));

      const response = await firstValueFrom(service.getBvmfTradingHours());

      expect(response.success).toBe(false);
      expect(response.data.isOpen).toBe(false);
    });
  });
});
