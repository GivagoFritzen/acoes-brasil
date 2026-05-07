import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PortfolioService } from './portfolio.service';
import { API_CONFIG } from '../config/api.config';
import { DeleteResponse } from '../models/delete-response.model';
import { CreatePortfolioPayload } from '../models/create-portfolio-payload.model';
import { firstValueFrom } from 'rxjs';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.portfolios}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PortfolioService],
    });

    service = TestBed.inject(PortfolioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPortfolios', () => {
    it('deve buscar carteiras com GET', () => {
      const response = [{ id: '1', codigo: 'PETR4' }] as any;

      service.getPortfolios().subscribe(data => expect(data).toEqual(response));

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('deve tratar erro HTTP 500', async () => {
      const promise = firstValueFrom(service.getPortfolios());

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: any) {
        expect(error.status).toBe(500);
      }
    });
  });

  describe('createPortfolio', () => {
    it('deve criar carteira com POST', () => {
      const payload = { codigo: 'ITUB4' } as CreatePortfolioPayload;

      service.createPortfolio(payload).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(payload);
    });

    it('deve tratar erro HTTP 400 ao criar carteira', async () => {
      const payload = { codigo: 'INVALID' } as CreatePortfolioPayload;
      const promise = firstValueFrom(service.createPortfolio(payload));

      const req = httpMock.expectOne(baseUrl);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: any) {
        expect(error.status).toBe(400);
      }
    });
  });

  describe('deletePortfolio', () => {
    it('deve deletar carteira com DELETE', () => {
      const id = '123';
      const response = { success: true, message: 'Deleted' } as DeleteResponse;

      service.deletePortfolio(id).subscribe(data => expect(data).toEqual(response));

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);
    });

    it('deve tratar erro HTTP 404 ao deletar carteira inexistente', async () => {
      const id = '999';
      const promise = firstValueFrom(service.deletePortfolio(id));

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });
});
