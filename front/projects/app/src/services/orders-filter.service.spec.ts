import { OrdersFilterService } from './orders-filter.service';

describe('OrdersFilterService', () => {
  let service: OrdersFilterService;

  beforeEach(() => {
    service = new OrdersFilterService();
  });

  it('deve aplicar filtros correntes como filtros aplicados', () => {
    service.updateCodigo('PETR4');
    service.updateOperacao('Compra');
    service.updateData('2026-01-10');
    service.updateDataFinal('2026-01-20');

    const applied = service.applyFilters();

    expect(applied).toEqual({
      codigo: 'PETR4',
      operacao: 'Compra',
      dataInicial: '2026-01-10',
      dataFinal: '2026-01-20',
    });
    expect(service.hasActiveFilters()).toBe(true);
  });

  it('deve limpar filtros correntes e aplicados', () => {
    service.updateCodigo('ITUB4');
    service.applyFilters();

    service.clearFilters();

    expect(service.getAppliedFilters()).toEqual({ codigo: '', operacao: '', dataInicial: '', dataFinal: '' });
    expect(service.hasActiveFilters()).toBe(false);
  });
});
