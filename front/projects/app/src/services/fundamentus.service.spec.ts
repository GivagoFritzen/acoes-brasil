import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FundamentusService } from './fundamentus.service';
import { API_CONFIG } from '../config/api.config';

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

  it('deve buscar detalhes da ação usando código normalizado', () => {
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

  it('deve retornar erro padronizado quando API falhar', () => {
    const apiErrorResponse = { message: 'Ticker inválido' };

    service.getAcaoDetails('XXXX').subscribe({
      next: () => {
        throw new Error('deveria ter retornado erro');
      },
      error: error => {
        expect(error.message).toBe('Ticker inválido');
        expect(error.status).toBe(404);
        expect(error.error).toEqual(apiErrorResponse);
      },
    });

    const req = httpMock.expectOne(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fundamentus}/XXXX`);
    req.flush(apiErrorResponse, { status: 404, statusText: 'Not Found' });
  });
});