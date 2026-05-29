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
      const responseMock = { codigo: 'VALE3' } as any;

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

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: any) {
        expect(error.message).toBe('Ticker inválido');
        expect(error.status).toBe(404);
        expect(error.error).toEqual(apiErrorResponse);
      }
    });

    it('deve tratar erro HTTP 500', async () => {
      const promise = firstValueFrom(service.getAcaoDetails('PETR4'));

      const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/PETR4`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: any) {
        expect(error.status).toBe(500);
      }
    });
  });
});