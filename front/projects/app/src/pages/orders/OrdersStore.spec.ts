import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrdersStore } from './OrdersStore';
import { OrdersService } from '../../services/OrdersService';
import { NotificationService } from '../../services/NotificationService';
import { TranslationService } from '../../services/TranslationService';
import { Order, OrdersResponse } from '../../models';

describe('OrdersStore', () => {
  let store: OrdersStore;
  let ordersServiceMock: {
    getOrders: any;
    createOrder: any;
    updateOrder: any;
    deleteOrder: any;
  };
  let notificationServiceMock: {
    alerts: any;
    success: any;
    error: any;
    clear: any;
  };
  let translationServiceMock: {
    get: any;
  };

  const sampleOrder: Order = {
    id: '1',
    codigo: 'PETR4',
    operacao: 'Compra',
    tipo: 'ACAO',
    quantidade: 100,
    valor: 35.5,
    data: '2026-01-15',
  };

  const sampleResponse: OrdersResponse = {
    data: [sampleOrder],
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    ordersServiceMock = {
      getOrders: vi.fn().mockReturnValue(of(sampleResponse)),
      createOrder: vi.fn().mockReturnValue(of(sampleOrder)),
      updateOrder: vi.fn().mockReturnValue(of(sampleOrder)),
      deleteOrder: vi.fn().mockReturnValue(of({ message: 'Deletado' })),
    };

    notificationServiceMock = {
      alerts: vi.fn().mockReturnValue([]),
      success: vi.fn(),
      error: vi.fn(),
      clear: vi.fn(),
    };

    translationServiceMock = {
      get: vi.fn().mockImplementation((key: string) => key),
    };

    TestBed.configureTestingModule({
      providers: [
        OrdersStore,
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    });

    store = TestBed.inject(OrdersStore);
  });

  it('deve carregar ordens com sucesso', () => {
    store.loadOrders();

    expect(ordersServiceMock.getOrders).toHaveBeenCalled();
    expect(store.orders()).toEqual([sampleOrder]);
    expect(store.isLoading()).toBe(false);
  });

  it('deve tratar erro ao carregar ordens', () => {
    ordersServiceMock.getOrders.mockReturnValue(throwError(() => new Error('Falha')));

    store.loadOrders();

    expect(store.errorMessage()).toBe('orders.alerts.loadFailed');
    expect(notificationServiceMock.error).toHaveBeenCalled();
    expect(store.isLoading()).toBe(false);
  });

  it('deve aplicar e limpar filtros', () => {
    store.setAppliedFilters({ codigo: 'VALE3', operacao: 'Compra', dataInicial: '', dataFinal: '' });
    expect(store.appliedFilters().codigo).toBe('VALE3');
    expect(store.page()).toBe(1);

    store.clearFilters();
    expect(store.appliedFilters().codigo).toBe('');
  });

  it('deve navegar entre páginas', () => {
    store.page.set(1);
    store.totalPages.set(3);

    store.nextPage();
    expect(ordersServiceMock.getOrders).toHaveBeenCalled();
    expect(store.page()).toBe(1);

    store.previousPage();
    expect(ordersServiceMock.getOrders).toHaveBeenCalled();
  });

  it('deve criar ordem com sucesso', () => {
    const onComplete = vi.fn();
    store.createOrder(
      {
        codigo: 'PETR4',
        operacao: 'Compra',
        tipo: 'ACAO',
        quantidade: 100,
        valor: 35,
        data: '2026-01-01',
      },
      onComplete
    );

    expect(ordersServiceMock.createOrder).toHaveBeenCalled();
    expect(notificationServiceMock.success).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('deve deletar ordem e notificar sucesso', () => {
    const onSuccess = vi.fn();
    store.deleteOrder(sampleOrder, false, { onSuccess });

    expect(ordersServiceMock.deleteOrder).toHaveBeenCalledWith('1');
    expect(notificationServiceMock.success).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('deve capturar divergências na deleção', () => {
    const onDivergence = vi.fn();
    const divergencias = [
      {
        codigo: 'PETR4',
        operacao: 'Venda' as const,
        quantidade: 50,
        quantidadeDisponivel: 0,
        mensagem: 'Saldo insuficiente',
      },
    ];
    ordersServiceMock.deleteOrder.mockReturnValue(of({ divergencias }));

    store.deleteOrder(sampleOrder, false, { onDivergence });

    expect(store.deleteDivergences()).toEqual(divergencias);
    expect(onDivergence).toHaveBeenCalledWith(divergencias);
  });
});
