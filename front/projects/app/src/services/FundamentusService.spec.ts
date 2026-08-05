import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FundamentusService } from './FundamentusService';
import { API_CONFIG } from '../config/ApiConfig';
import { firstValueFrom } from 'rxjs';

describe('FundamentusService', () => {
  let service: FundamentusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FundamentusService],
    });

    service = TestBed.inject(FundamentusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAcaoDetails', () => {
    it('deve buscar detalhes da ação usando código normalizado com espaços', () => {
      const responseMock = {
        codigo: 'PETR4',
        empresa: 'Petrobras',
        indicadores: [],
      };

      service.getAcaoDetails(' petr4 ').subscribe(response => {
        expect(response).toEqual(responseMock);
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4`);
      expect(req.request.method).toBe('GET');
      req.flush(responseMock);
    });

    it('deve normalizar código lowercase para uppercase', () => {
      const responseMock = { codigo: 'VALE3', empresa: null, setor: null, subsetor: null, indicadores: [], updatedAt: '' };

      service.getAcaoDetails('vale3').subscribe(response => {
        expect(response).toEqual(responseMock);
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/VALE3`);
      expect(req.request.method).toBe('GET');
      req.flush(responseMock);
    });

    it('deve retornar erro padronizado quando API falhar', async () => {
      const apiErrorResponse = { message: 'Ticker inválido' };

      const promise = firstValueFrom(service.getAcaoDetails('XXXX'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/XXXX`);
      req.flush(apiErrorResponse, { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({
        message: 'Ticker inválido',
        status: 404,
        error: apiErrorResponse,
      });
    });

    it('deve tratar erro HTTP 500', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await expect(promise).rejects.toMatchObject({
        status: 500,
      });
    });

    it('deve tratar erro de conexão (status 0)', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4`);
      req.error(new ErrorEvent('Network error'), { status: 0 });

      await expect(promise).rejects.toMatchObject({ status: 0 });
    });

    it('deve tratar erro HTTP 401', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      await expect(promise).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('getProventos', () => {
    it('deve buscar proventos com GET e código normalizado', () => {
      const responseMock = { proventos: [{ data: '2024-01-01', valor: 1.5 }] };

      service.getProventos(' petr4 ').subscribe(response => {
        expect(response).toEqual(responseMock);
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4/proventos`);
      expect(req.request.method).toBe('GET');
      req.flush(responseMock);
    });

    it('deve normalizar código lowercase para uppercase em getProventos', () => {
      const responseMock = { proventos: [] };

      service.getProventos('vale3').subscribe(response => {
        expect(response).toEqual(responseMock);
      });

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/VALE3/proventos`);
      expect(req.request.method).toBe('GET');
      req.flush(responseMock);
    });

    it('deve tratar erro HTTP 404 em getProventos', async () => {
      const promise = firstValueFrom(service.getProventos('XXXX'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/XXXX/proventos`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });

    it('deve tratar erro HTTP 500 em getProventos', async () => {
      const promise = firstValueFrom(service.getProventos('PETR4'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4/proventos`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await expect(promise).rejects.toMatchObject({ status: 500 });
    });

    it('deve usar mensagem de erro do servidor quando disponível em getProventos', async () => {
      const apiErrorResponse = { message: 'Ticker inválido' };
      const promise = firstValueFrom(service.getProventos('XXXX'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/XXXX/proventos`);
      req.flush(apiErrorResponse, { status: 400, statusText: 'Bad Request' });

      await expect(promise).rejects.toMatchObject({
        message: 'Ticker inválido',
        status: 400,
        error: apiErrorResponse,
      });
    });

    it('deve tratar erro de conexão (status 0) em getProventos', async () => {
      const promise = firstValueFrom(service.getProventos('PETR4'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4/proventos`);
      req.error(new ErrorEvent('Network error'), { status: 0 });

      await expect(promise).rejects.toMatchObject({ status: 0 });
    });
  });
});