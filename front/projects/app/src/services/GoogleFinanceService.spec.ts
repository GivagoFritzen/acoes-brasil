import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GoogleFinanceService } from './GoogleFinanceService';
import { API_CONFIG } from '../config/ApiConfig';
import { firstValueFrom } from 'rxjs';
import type { GoogleFinanceResponse } from '../../../../../common/models/google-finance';

const mockResponse: GoogleFinanceResponse = {
  quote: {
    ticker: 'PETR4',
    exchange: 'BVMF',
    name: 'Petrobras',
    price: 42.5,
    change: 1.2,
    changePercent: 2.91,
    previousClose: 41.3,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
  },
  chart: {
    previousClose: 41.3,
    points: [
      { timestamp: 1700000000000, date: '2024-01-01', price: 42.5, volume: 1000 },
    ],
  },
  updatedAt: '2024-01-01T12:00:00.000Z',
};

describe('GoogleFinanceService', () => {
  let service: GoogleFinanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GoogleFinanceService],
    });

    service = TestBed.inject(GoogleFinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar dados com codigo normalizado', () => {
    service.getData('PETR4').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleFinance}/PETR4?window=1Y`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('deve usar chartWindow passada como query param', () => {
    service.getData('PETR4', '5Y').subscribe();

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleFinance}/PETR4?window=5Y`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('deve usar window padrao 1Y quando nao especificado', () => {
    service.getData('PETR4').subscribe();

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleFinance}/PETR4?window=1Y`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('deve normalizar codigo para maiusculas e trim', () => {
    service.getData('  petr4  ').subscribe();

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleFinance}/PETR4?window=1Y`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('deve retornar erro padronizado quando API falha com 404', async () => {
    const apiErrorResponse = { message: 'Ativo não encontrado' };

    const promise = firstValueFrom(service.getData('XXXX'));

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleFinance}/XXXX?window=1Y`);
    req.flush(apiErrorResponse, { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({
        message: 'Ativo não encontrado',
        status: 404,
        error: apiErrorResponse,
      });
  });

  it('deve tratar erro HTTP 500', async () => {
    const promise = firstValueFrom(service.getData('PETR4'));

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleFinance}/PETR4?window=1Y`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await expect(promise).rejects.toMatchObject({
        status: 500,
      });
  });

  it('deve retornar erro de conexao quando status 0', async () => {
    const promise = firstValueFrom(service.getData('PETR4'));

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.googleFinance}/PETR4?window=1Y`);
    req.error(new ProgressEvent('error'));

      await expect(promise).rejects.toMatchObject({
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      });
  });
});
