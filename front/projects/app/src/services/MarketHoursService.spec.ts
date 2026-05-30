import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MarketHoursService } from './MarketHoursService';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

describe('MarketHoursService', () => {
  let service: MarketHoursService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MarketHoursService],
    });

    service = TestBed.inject(MarketHoursService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getBvmfMarketHours', () => {
    it('deve fazer GET para URL correta', () => {
      const payload = { data: 'ok' } as any;

      service.getBvmfMarketHours().subscribe(response => {
        expect(response).toEqual(payload);
      });

      const req = httpMock.expectOne('https://markethours.io/api/markets/bvmf');
      expect(req.request.method).toBe('GET');
      req.flush(payload);
    });

    it('deve validar URL completa da API', () => {
      const payload = { data: 'test' } as any;

      service.getBvmfMarketHours().subscribe(response => {
        expect(response.data).toBe('test');
      });

      const req = httpMock.expectOne(req => req.url === 'https://markethours.io/api/markets/bvmf');
      expect(req.request.method).toBe('GET');
      req.flush(payload);
    });

    it('deve tratar erro HTTP 500', async () => {
      const errorMessage = 'Erro interno do servidor';

      const promise = firstValueFrom(service.getBvmfMarketHours());

      const req = httpMock.expectOne('https://markethours.io/api/markets/bvmf');
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect(true).toBe(false); // Deveria ter falhado
      } catch (error) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(500);
        expect(httpError.statusText).toBe('Internal Server Error');
      }
    });

    it('deve tratar erro HTTP 404', async () => {
      const promise = firstValueFrom(service.getBvmfMarketHours());

      const req = httpMock.expectOne('https://markethours.io/api/markets/bvmf');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      try {
        await promise;
        expect(true).toBe(false); // Deveria ter falhado
      } catch (error) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(404);
      }
    });
  });
});
