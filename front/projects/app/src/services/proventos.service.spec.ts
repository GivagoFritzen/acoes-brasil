import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProventosService } from './proventos.service';
import { API_CONFIG } from '../config/api.config';

describe('ProventosService', () => {
  let service: ProventosService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.proventos}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProventosService],
    });

    service = TestBed.inject(ProventosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar proventos com filtros', () => {
    service.getProventos({ codigo: 'TAEE11', agruparPorCodigo: true }).subscribe();

    const req = httpMock.expectOne(r => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('codigo')).toBe('TAEE11');
    expect(req.request.params.get('agruparPorCodigo')).toBe('true');
    req.flush({ data: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 10 } });
  });

  it('deve criar provento', () => {
    const payload = { codigo: 'TAEE11' } as any;
    service.createProvento(payload).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });
});
