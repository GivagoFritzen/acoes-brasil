import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdersService } from './OrdersService';
import { API_CONFIG } from '../config/ApiConfig';
import { OrdersResponse } from '../models';
import { CreateOrderPayload } from '../models/CreateOrderPayloadModel';
import { ImportResponse } from '../models/ImportResponseModel';
import { DeleteResponse } from '../models/DeleteResponseModel';
import { SellSnapshotExportRow } from '../models/SellSnapshotExportRowModel';
import { firstValueFrom } from 'rxjs';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.orders}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrdersService],
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getOrders', () => {
    it('deve buscar ordens com query params opcionais', () => {
      const response = { data: [], page: 2, totalPages: 1, total: 0, limit: 15 } as OrdersResponse;

      service.getOrders({ codigo: 'PETR4', page: 2, limit: 15 }).subscribe();

      const req = httpMock.expectOne(r => r.url === baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('codigo')).toBe('PETR4');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('15');
      req.flush(response);
    });

    it('deve buscar ordens com todos os parâmetros', () => {
      const response = { data: [], page: 1, totalPages: 1, total: 0, limit: 10 } as OrdersResponse;

      service.getOrders({
        codigo: 'VALE3',
        operacao: 'Compra',
        data: '2026-01-10',
        dataInicial: '2026-01-01',
        dataFinal: '2026-01-31',
      }).subscribe();

      const req = httpMock.expectOne(r => r.url === baseUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('codigo')).toBe('VALE3');
      expect(req.request.params.get('operacao')).toBe('Compra');
      expect(req.request.params.get('data')).toBe('2026-01-10');
      expect(req.request.params.get('dataInicial')).toBe('2026-01-01');
      expect(req.request.params.get('dataFinal')).toBe('2026-01-31');
      req.flush(response);
    });

    it('deve tratar erro HTTP 500', async () => {
      const promise = firstValueFrom(service.getOrders());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(500);
      }
    });

    it('deve tratar erro de conexão (status 0)', async () => {
      const promise = firstValueFrom(service.getOrders());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.error(new ErrorEvent('Network error'), { status: 0 });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(0);
        expect(httpError.message).toBe('Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    });

    it('deve tratar erro HTTP 401 (não autorizado)', async () => {
      const promise = firstValueFrom(service.getOrders());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(401);
        expect(httpError.message).toBe('Não autorizado.');
      }
    });

    it('deve tratar erro HTTP 403 (acesso negado)', async () => {
      const promise = firstValueFrom(service.getOrders());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(403);
        expect(httpError.message).toBe('Acesso negado.');
      }
    });

    it('deve usar mensagem de erro do servidor quando disponível', async () => {
      const promise = firstValueFrom(service.getOrders());

      const req = httpMock.expectOne(r => r.url === baseUrl);
      req.flush({ message: 'Erro customizado do servidor' }, { status: 400, statusText: 'Bad Request' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(400);
        expect(httpError.message).toBe('Erro customizado do servidor');
      }
    });
  });

  describe('createOrder', () => {
    it('deve criar ordem com POST', () => {
      const payload = { codigo: 'ITUB4' } as CreateOrderPayload;

      service.createOrder(payload).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(payload);
    });

    it('deve tratar erro HTTP 400 ao criar ordem', async () => {
      const payload = { codigo: 'INVALID' } as CreateOrderPayload;
      const promise = firstValueFrom(service.createOrder(payload));

      const req = httpMock.expectOne(baseUrl);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(400);
      }
    });
  });

  describe('deleteOrder', () => {
    it('deve deletar ordem com DELETE', () => {
      const id = '123';
      const response = { success: true, message: 'Deleted' } as DeleteResponse;

      service.deleteOrder(id).subscribe(data => expect(data).toEqual(response));

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);
    });

    it('deve tratar erro HTTP 404 ao deletar ordem inexistente', async () => {
      const id = '999';
      const promise = firstValueFrom(service.deleteOrder(id));

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(404);
      }
    });
  });

  describe('importOrdersSpreadsheet', () => {
    it('deve importar planilha com FormData', () => {
      const file = new File(['content'], 'orders.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const response = { success: true, imported: 10 } as ImportResponse;

      service.importOrdersSpreadsheet(file).subscribe(data => expect(data).toEqual(response));

      const req = httpMock.expectOne(`${baseUrl}/import`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(response);
    });

    it('deve tratar erro HTTP 500 ao importar planilha', async () => {
      const file = new File(['content'], 'orders.xlsx');
      const promise = firstValueFrom(service.importOrdersSpreadsheet(file));

      const req = httpMock.expectOne(`${baseUrl}/import`);
      req.flush('Import failed', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(500);
      }
    });
  });

  describe('exportSellSnapshotsSpreadsheet', () => {
    it('deve exportar planilha de sell snapshots retornando Blob', () => {
      const blob = new Blob(['content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      service.exportSellSnapshotsSpreadsheet().subscribe(data => {
        expect(data instanceof Blob).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/export/sell-snapshots`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });

    it('deve tratar erro HTTP 500 ao exportar planilha', async () => {
      const promise = firstValueFrom(service.exportSellSnapshotsSpreadsheet());

      const req = httpMock.expectOne(`${baseUrl}/export/sell-snapshots`);
      req.error(new ErrorEvent('Network error'), { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(500);
      }
    });
  });

  describe('getSellSnapshotsForPdf', () => {
    it('deve buscar dados para PDF com GET', () => {
      const response = [{ codigo: 'PETR4', quantidade: 100 }] as SellSnapshotExportRow[];

      service.getSellSnapshotsForPdf().subscribe(data => expect(data).toEqual(response));

      const req = httpMock.expectOne(`${baseUrl}/export/sell-snapshots/data`);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('deve tratar erro HTTP 500 ao buscar dados para PDF', async () => {
      const promise = firstValueFrom(service.getSellSnapshotsForPdf());

      const req = httpMock.expectOne(`${baseUrl}/export/sell-snapshots/data`);
      req.flush('Failed', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        expect('não deveria chegar aqui').toBe(false);
      } catch (error: unknown) {
        const httpError = error as HttpErrorResponse;
        expect(httpError.status).toBe(500);
      }
    });
  });
});
