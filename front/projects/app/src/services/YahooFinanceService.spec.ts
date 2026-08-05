import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { YahooFinanceService } from './YahooFinanceService';
import { API_CONFIG } from '../config/ApiConfig';
import { firstValueFrom } from 'rxjs';

describe('YahooFinanceService', () => {
  let service: YahooFinanceService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.yahooFinance}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [YahooFinanceService],
    });

    service = TestBed.inject(YahooFinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAcaoDetails', () => {
    it('deve buscar detalhes da ação com GET e código normalizado', () => {
      const responseMock = { codigo: 'PETR4', empresa: 'Petrobras' };

      service.getAcaoDetails(' petr4 ').subscribe(response => {
        expect(response).toEqual(responseMock);
      });

      const req = httpMock.expectOne(`${baseUrl}/PETR4`);
      expect(req.request.method).toBe('GET');
      req.flush(responseMock);
    });

    it('deve normalizar código lowercase para uppercase', () => {
      const responseMock = { codigo: 'VALE3' };

      service.getAcaoDetails('vale3').subscribe(response => {
        expect(response).toEqual(responseMock);
      });

      const req = httpMock.expectOne(`${baseUrl}/VALE3`);
      expect(req.request.method).toBe('GET');
      req.flush(responseMock);
    });

    it('deve normalizar código com espaços extras', () => {
      const responseMock = { codigo: 'ITUB4' };

      service.getAcaoDetails('  ITUB4  ').subscribe(response => {
        expect(response).toEqual(responseMock);
      });

      const req = httpMock.expectOne(`${baseUrl}/ITUB4`);
      expect(req.request.method).toBe('GET');
      req.flush(responseMock);
    });

    it('deve tratar erro HTTP 500', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${baseUrl}/PETR4`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await expect(promise).rejects.toMatchObject({ status: 500 });
    });

    it('deve tratar erro HTTP 404', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('XXXX'));

      const req = httpMock.expectOne(`${baseUrl}/XXXX`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });

    it('deve tratar erro de conexão (status 0)', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${baseUrl}/PETR4`);
      req.error(new ErrorEvent('Network error'), { status: 0 });

      await expect(promise).rejects.toMatchObject({ status: 0 });
    });

    it('deve usar mensagem de erro do servidor quando disponível', async () => {
      const apiErrorResponse = { message: 'Ticker inválido' };
      const promise = firstValueFrom(service.getAcaoDetails('XXXX'));

      const req = httpMock.expectOne(`${baseUrl}/XXXX`);
      req.flush(apiErrorResponse, { status: 400, statusText: 'Bad Request' });

      await expect(promise).rejects.toMatchObject({
        message: 'Ticker inválido',
        status: 400,
        error: apiErrorResponse,
      });
    });

    it('deve tratar erro HTTP 401', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${baseUrl}/PETR4`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      await expect(promise).rejects.toMatchObject({ status: 401 });
    });

    it('deve tratar erro HTTP 403', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${baseUrl}/PETR4`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      await expect(promise).rejects.toMatchObject({ status: 403 });
    });
  });
});
