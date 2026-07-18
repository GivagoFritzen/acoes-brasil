import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ProventosService } from './ProventosService';
import { API_CONFIG } from '../config/ApiConfig';
import { ProventosResponse } from '../models';
import { CreateProventoPayload } from '../models/CreateProventoPayloadModel';
import { ImportResponse } from '../models/ImportResponseModel';
import { DeleteResponse } from '../models/DeleteResponseModel';
import { firstValueFrom } from 'rxjs';

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

  describe('getProventos', () => {
    it('deve buscar proventos com filtros', () => {
      const response = { data: [], page: 1, totalPages: 1, total: 0, limit: 10 } as ProventosResponse;

      service.getProventos({ codigo: 'TAEE11', agruparPorCodigo: true }).subscribe();

      const req = httpMock.expectOne(r => r.url === baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('codigo')).toBe('TAEE11');
      expect(req.request.params.get('agruparPorCodigo')).toBe('true');
      req.flush(response);
    });

    it('deve buscar proventos com todos os parâmetros', () => {
      const response = { data: [], page: 2, totalPages: 5, total: 50, limit: 10 } as ProventosResponse;

      service.getProventos({
        codigo: 'PETR4',
        tipo: 'Dividendo',
        data: '2026-01-10',
        dataInicial: '2026-01-01',
        dataFinal: '2026-01-31',
        agruparPorCodigo: false,
        page: 2,
        limit: 10
      }).subscribe();

      const req = httpMock.expectOne(r => r.url === baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('codigo')).toBe('PETR4');
      expect(req.request.params.get('tipo')).toBe('Dividendo');
      expect(req.request.params.get('data')).toBe('2026-01-10');
      expect(req.request.params.get('dataInicial')).toBe('2026-01-01');
      expect(req.request.params.get('dataFinal')).toBe('2026-01-31');
      expect(req.request.params.get('agruparPorCodigo')).toBe('false');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(response);
    });

    it('deve tratar erro HTTP 500', async () => {
      const promise = firstValueFrom(service.getProventos());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(500);
      }
    });

    it('deve tratar erro de conexão (status 0)', async () => {
      const promise = firstValueFrom(service.getProventos());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.error(new ErrorEvent('Network error'), { status: 0 });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(0);
        expect(error.message).toBe('Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    });

    it('deve tratar erro HTTP 401 (não autorizado)', async () => {
      const promise = firstValueFrom(service.getProventos());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Não autorizado.');
      }
    });

    it('deve tratar erro HTTP 403 (acesso negado)', async () => {
      const promise = firstValueFrom(service.getProventos());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(403);
        expect(error.message).toBe('Acesso negado.');
      }
    });

    it('deve usar mensagem de erro do servidor quando disponível', async () => {
      const promise = firstValueFrom(service.getProventos());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush({ message: 'Erro customizado do servidor' }, { status: 400, statusText: 'Bad Request' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Erro customizado do servidor');
      }
    });
  });

  describe('createProvento', () => {
    it('deve criar provento com POST', () => {
      const payload = { codigo: 'TAEE11' } as CreateProventoPayload;

      service.createProvento(payload).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(payload);
    });

    it('deve tratar erro HTTP 400 ao criar provento', async () => {
      const payload = { codigo: 'INVALID' } as CreateProventoPayload;
      const promise = firstValueFrom(service.createProvento(payload));

      const req = httpMock.expectOne(baseUrl);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(400);
      }
    });
  });

  describe('deleteProvento', () => {
    it('deve deletar provento com DELETE', () => {
      const id = '123';
      const response = { success: true, message: 'Deleted' } as DeleteResponse;

      service.deleteProvento(id).subscribe(data => expect(data).toEqual(response));

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);
    });

    it('deve tratar erro HTTP 404 ao deletar provento inexistente', async () => {
      const id = '999';
      const promise = firstValueFrom(service.deleteProvento(id));

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('importProventosSpreadsheet', () => {
    it('deve importar planilha com FormData', () => {
      const file = new File(['content'], 'proventos.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const response = { success: true, imported: 10 } as ImportResponse;

      service.importProventosSpreadsheet(file).subscribe(data => expect(data).toEqual(response));

      const req = httpMock.expectOne(`${baseUrl}/import`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(response);
    });

    it('deve tratar erro HTTP 500 ao importar planilha', async () => {
      const file = new File(['content'], 'proventos.xlsx');
      const promise = firstValueFrom(service.importProventosSpreadsheet(file));

      const req = httpMock.expectOne(`${baseUrl}/import`);
      req.flush('Import failed', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: HttpErrorResponse) {
        expect(error.status).toBe(500);
      }
    });
  });
});
