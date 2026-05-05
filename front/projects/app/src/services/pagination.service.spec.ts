import { PaginationService } from './pagination.service';

describe('PaginationService', () => {
  let service: PaginationService;

  beforeEach(() => {
    service = new PaginationService();
  });

  it('deve iniciar com estado padrão', () => {
    expect(service.getState()).toEqual({ page: 1, limit: 10, totalPages: 1 });
  });

  it('deve atualizar limite e resetar página para 1', () => {
    service.updateTotalPages(5);
    service.updatePage(3);

    service.updateLimit(25);

    expect(service.page()).toBe(1);
    expect(service.limit()).toBe(25);
  });

  it('deve navegar próxima e anterior quando permitido', () => {
    service.updateTotalPages(3);
    expect(service.nextPage()).toBe(true);
    expect(service.page()).toBe(2);
    expect(service.previousPage()).toBe(true);
    expect(service.page()).toBe(1);
  });
});
