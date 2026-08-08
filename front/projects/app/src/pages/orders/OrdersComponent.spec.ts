import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import type { Order, OrdersResponse } from '../../models';
import type { CreateOrderPayload } from '../../models/CreateOrderPayloadModel';
import { OrdersService } from '../../services/OrdersService';
import { TranslationService } from '../../services/TranslationService';
import { OrdersComponent } from './OrdersComponent';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let ordersServiceMock: {
    getOrders: ReturnType<typeof vi.fn>;
    createOrder: ReturnType<typeof vi.fn>;
    deleteOrder: ReturnType<typeof vi.fn>;
    updateOrder: ReturnType<typeof vi.fn>;
  };
  let mockTranslationService: { get: ReturnType<typeof vi.fn> };

  const baseOrder: Order = {
    id: '1',
    codigo: 'PETR4',
    valor: 10,
    quantidade: 2,
    data: '2024-01-01',
    tipo: 'ACAO',
    operacao: 'Compra',
  };

  const defaultResponse: OrdersResponse = {
    data: [baseOrder],
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    ordersServiceMock = {
      getOrders: vi.fn(),
      createOrder: vi.fn(),
      deleteOrder: vi.fn(),
      updateOrder: vi.fn(),
    };
    ordersServiceMock.getOrders.mockReturnValue(of(defaultResponse));

    mockTranslationService = {
      get: vi.fn().mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'common.alerts.error': 'Erro',
          'common.alerts.success': 'Sucesso',
          'orders.filterBuy': 'Compra',
          'orders.filterSell': 'Venda',
          'orders.alerts.loadFailed': 'Não foi possível carregar as ordens.',
          'orders.alerts.createFailed': 'Não foi possível adicionar a ordem.',
          'orders.alerts.deleteFailed': 'Não foi possível deletar a ordem.',
          'orders.alerts.orderCreated': 'Ordem adicionada com sucesso.',
          'orders.alerts.orderDeleted': 'Ordem removida com sucesso.',
          'orders.alerts.orderUpdated': 'Ordem atualizada com sucesso.',
        };
        return translations[key] ?? '';
      }),
    };

    await TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar ordens no ngOnInit', () => {
    component.ngOnInit();

    expect(ordersServiceMock.getOrders).toHaveBeenCalledWith({
      codigo: undefined,
      operacao: undefined,
      dataInicial: undefined,
      dataFinal: undefined,
      page: 1,
      limit: 10,
    });
    expect(component.orders()).toEqual([baseOrder]);
    expect(component.page()).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('deve setar filtro de data inicial', () => {
    component.handleFilterStartChange('2024-01-10');
    expect(component.filtroData()).toBe('2024-01-10');
  });

  it('deve normalizar e setar filtro de código', () => {
    component.handleFilterCodeChange('petr4f');
    expect(component.filtroCodigo()).toBe('PETR4F');
  });

  it('deve setar filtro de operação válida e ignorar inválida', () => {
    component.handleFilterOperacaoChange('Venda');
    expect(component.filtroOperacao()).toBe('Venda');

    component.handleFilterOperacaoChange('Invalida');
    expect(component.filtroOperacao()).toBe('');

    component.handleFilterOperacaoChange('');
    expect(component.filtroOperacao()).toBe('');
  });

  it('deve setar filtro de data final', () => {
    component.handleFilterEndChange('2024-01-20');
    expect(component.filtroDataFinal()).toBe('2024-01-20');
  });

  it('deve ajustar data final quando data inicial for maior', () => {
    component.filtroDataFinal.set('2024-01-10');
    component.handleFilterStartChange('2024-01-20');
    expect(component.filtroData()).toBe('2024-01-20');
    expect(component.filtroDataFinal()).toBe('2024-01-20');
  });

  it('deve ajustar data inicial quando data final for menor', () => {
    component.filtroData.set('2024-01-20');
    component.handleFilterEndChange('2024-01-10');
    expect(component.filtroDataFinal()).toBe('2024-01-10');
    expect(component.filtroData()).toBe('2024-01-10');
  });

  it('deve manter data final quando data inicial for menor ou igual', () => {
    component.filtroDataFinal.set('2024-01-20');
    component.handleFilterStartChange('2024-01-10');
    expect(component.filtroData()).toBe('2024-01-10');
    expect(component.filtroDataFinal()).toBe('2024-01-20');

    component.filtroDataFinal.set('2024-01-20');
    component.handleFilterStartChange('2024-01-20');
    expect(component.filtroData()).toBe('2024-01-20');
    expect(component.filtroDataFinal()).toBe('2024-01-20');
  });

  it('deve manter data inicial quando data final for maior ou igual', () => {
    component.filtroData.set('2024-01-10');
    component.handleFilterEndChange('2024-01-20');
    expect(component.filtroDataFinal()).toBe('2024-01-20');
    expect(component.filtroData()).toBe('2024-01-10');

    component.filtroData.set('2024-01-10');
    component.handleFilterEndChange('2024-01-10');
    expect(component.filtroDataFinal()).toBe('2024-01-10');
    expect(component.filtroData()).toBe('2024-01-10');
  });

  it('deve manter filtro final quando valor vazio', () => {
    component.filtroDataFinal.set('2024-01-20');
    component.handleFilterStartChange('');
    expect(component.filtroData()).toBe('');
    expect(component.filtroDataFinal()).toBe('2024-01-20');
  });

  it('deve manter filtro inicial quando valor vazio', () => {
    component.filtroData.set('2024-01-20');
    component.handleFilterEndChange('');
    expect(component.filtroDataFinal()).toBe('');
    expect(component.filtroData()).toBe('2024-01-20');
  });

  it('deve aplicar filtros, resetar página e carregar ordens', () => {
    component.page.set(3);
    component.handleFilterCodeChange('vale3f');
    component.handleFilterOperacaoChange('Compra');
    component.handleFilterStartChange('2024-02-01');
    component.handleFilterEndChange('2024-02-28');

    component.applyFilter();

    expect(component.page()).toBe(1);
    expect(component.filtroCodigoAplicado()).toBe('VALE3F');
    expect(component.filtroOperacaoAplicado()).toBe('Compra');
    expect(component.filtroDataAplicado()).toBe('2024-02-01');
    expect(component.filtroDataFinalAplicado()).toBe('2024-02-28');
    expect(ordersServiceMock.getOrders).toHaveBeenCalledWith({
      codigo: 'VALE3F',
      operacao: 'Compra',
      dataInicial: '2024-02-01',
      dataFinal: '2024-02-28',
      page: 1,
      limit: 10,
    });
  });

  it('deve limpar filtros atuais e aplicados, resetar página e carregar ordens', () => {
    component.handleFilterCodeChange('bbas3f');
    component.handleFilterOperacaoChange('Venda');
    component.handleFilterStartChange('2024-03-01');
    component.handleFilterEndChange('2024-03-10');
    component.applyFilter();

    component.page.set(2);
    component.clearFilter();

    expect(component.filtroCodigo()).toBe('');
    expect(component.filtroOperacao()).toBe('');
    expect(component.filtroData()).toBe('');
    expect(component.filtroDataFinal()).toBe('');
    expect(component.filtroCodigoAplicado()).toBe('');
    expect(component.filtroOperacaoAplicado()).toBe('');
    expect(component.filtroDataAplicado()).toBe('');
    expect(component.filtroDataFinalAplicado()).toBe('');
    expect(component.page()).toBe(1);
  });

  it('previousPage não deve fazer nada na primeira página', () => {
    component.page.set(1);
    const callsBefore = ordersServiceMock.getOrders.mock.calls.length;

    component.previousPage();

    expect(component.page()).toBe(1);
    expect(ordersServiceMock.getOrders.mock.calls.length).toBe(callsBefore);
  });

  it('previousPage deve tentar decrementar e carregar ordens', () => {
    component.page.set(3);
    component.previousPage();

    expect(component.page()).toBe(1);
    expect(ordersServiceMock.getOrders).toHaveBeenCalled();
  });

  it('nextPage não deve fazer nada na última página', () => {
    component.page.set(2);
    component.totalPages.set(2);
    const callsBefore = ordersServiceMock.getOrders.mock.calls.length;

    component.nextPage();

    expect(component.page()).toBe(2);
    expect(ordersServiceMock.getOrders.mock.calls.length).toBe(callsBefore);
  });

  it('nextPage deve tentar incrementar e carregar ordens', () => {
    component.page.set(1);
    component.totalPages.set(3);

    component.nextPage();

    expect(component.page()).toBe(1);
    expect(ordersServiceMock.getOrders).toHaveBeenCalled();
  });

  it('deve remover alerta correspondente no dismiss', () => {
    const alert = { variant: 'info', title: 'Sucesso', message: 'ok', icon: '✓' } as const;
    component.alerts.set([
      alert,
      { variant: 'error', title: 'Erro', message: 'falhou', icon: '✕' },
    ]);

    component.handleAlertDismiss(alert);

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
  });

  it('deve retornar classe vermelha para ordem de venda', () => {
    const sellOrder: Order = { ...baseOrder, operacao: 'Venda' };
    expect(component.getOrderClass(sellOrder)).toBe('orders__row--red');
  });

  it('deve retornar classe vazia para ordem que não é venda', () => {
    expect(component.getOrderClass(baseOrder)).toBe('');
  });

  it('trackByOrderId deve retornar id do item', () => {
    expect(component.trackByOrderId(0, baseOrder)).toBe('1');
  });

  it('deve abrir modal de deleção e setar ordem alvo', () => {
    component.openDeleteModal(baseOrder);

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.orderToDelete()).toEqual(baseOrder);
  });

  it('deve abrir modal de criação', () => {
    component.openCreateModal();
    expect(component.isCreateModalOpen()).toBe(true);
  });

  it('não deve fechar modal de deleção durante deleção', () => {
    component.openDeleteModal(baseOrder);
    component.isDeleting.set(true);

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.orderToDelete()).toEqual(baseOrder);
  });

  it('deve fechar modal de deleção quando não está deletando', () => {
    component.openDeleteModal(baseOrder);
    component.isDeleting.set(false);

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.orderToDelete()).toBeNull();
  });

  it('não deve fechar modal de criação durante criação', () => {
    component.openCreateModal();
    component.isCreating.set(true);

    component.closeCreateModal();

    expect(component.isCreateModalOpen()).toBe(true);
  });

  it('deve fechar modal de criação quando não está criando', () => {
    component.openCreateModal();
    component.isCreating.set(false);

    component.closeCreateModal();

    expect(component.isCreateModalOpen()).toBe(false);
  });

  it('confirmCreateOrder sucesso: deve criar, fechar modal, alertar e recarregar', () => {
    const payload: CreateOrderPayload = {
      codigo: 'ITUB4',
      quantidade: 10,
      valor: 30,
      data: '2024-04-01',
      tipo: 'ACAO',
      operacao: 'Compra',
    };
    const createdOrder: Order = { ...baseOrder, id: '2', codigo: 'ITUB4' };
    ordersServiceMock.createOrder.mockReturnValue(of(createdOrder));
    component.openCreateModal();
    const getOrdersCallsBefore = ordersServiceMock.getOrders.mock.calls.length;

    component.confirmCreateOrder(payload);

    expect(ordersServiceMock.createOrder).toHaveBeenCalledWith(payload);
    expect(component.isCreating()).toBe(false);
    expect(component.isCreateModalOpen()).toBe(false);
    expect(component.alerts()).toEqual([]);
    expect(ordersServiceMock.getOrders.mock.calls.length).toBe(getOrdersCallsBefore + 1);
  });

  it('confirmCreateOrder erro: deve setar alerta de erro', () => {
    const payload: CreateOrderPayload = {
      codigo: 'ITUB4',
      quantidade: 10,
      valor: 30,
      data: '2024-04-01',
      tipo: 'ACAO',
      operacao: 'Compra',
    };
    ordersServiceMock.createOrder.mockReturnValue(throwError(() => new Error('erro')));

    component.confirmCreateOrder(payload);

    expect(component.isCreating()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível adicionar a ordem.');
  });

  it('confirmDeleteOrder sem orderToDelete: não deve chamar service', () => {
    component.orderToDelete.set(null);
    component.confirmDeleteOrder();

    expect(ordersServiceMock.deleteOrder).not.toHaveBeenCalled();
  });

  it('confirmDeleteOrder sucesso: deve deletar, fechar modal, alertar e recarregar', () => {
    ordersServiceMock.deleteOrder.mockReturnValue(of({ message: 'ok' }));
    component.openDeleteModal(baseOrder);
    const getOrdersCallsBefore = ordersServiceMock.getOrders.mock.calls.length;

    component.confirmDeleteOrder();

    expect(ordersServiceMock.deleteOrder).toHaveBeenCalledWith('1');
    expect(component.isDeleting()).toBe(false);
    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.orderToDelete()).toBeNull();
    expect(component.alerts()).toEqual([]);
    expect(ordersServiceMock.getOrders.mock.calls.length).toBe(getOrdersCallsBefore + 1);
  });

  it('confirmDeleteOrder erro: deve setar alerta de erro', () => {
    ordersServiceMock.deleteOrder.mockReturnValue(throwError(() => new Error('erro')));
    component.openDeleteModal(baseOrder);

    component.confirmDeleteOrder();

    expect(component.isDeleting()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível deletar a ordem.');
  });

  it('loadOrders erro via ngOnInit: deve setar errorMessage e alerta', () => {
    ordersServiceMock.getOrders.mockReturnValue(throwError(() => new Error('erro')));

    component.ngOnInit();

    expect(component.errorMessage()).toBe('Não foi possível carregar as ordens.');
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível carregar as ordens.');
    expect(component.isLoading()).toBe(false);
  });

  it('deve aplicar response com data indefinida como array vazio', () => {
    ordersServiceMock.getOrders.mockReturnValue(
      of({
        data: undefined! as Order[],
        page: 2,
        limit: 5,
        total: 0,
        totalPages: 4,
      }),
    );

    component.ngOnInit();

    expect(component.orders()).toEqual([]);
    expect(component.page()).toBe(2);
    expect(component.limit()).toBe(5);
    expect(component.totalPages()).toBe(4);
  });

  it('deve abrir modal de edição e setar ordem alvo', () => {
    component.openEditModal(baseOrder);

    expect(component.isEditModalOpen()).toBe(true);
    expect(component.orderToEdit()).toEqual(baseOrder);
  });

  it('não deve fechar modal de edição durante criação', () => {
    component.openEditModal(baseOrder);
    component.isCreating.set(true);

    component.closeEditModal();

    expect(component.isEditModalOpen()).toBe(true);
    expect(component.orderToEdit()).toEqual(baseOrder);
  });

  it('deve fechar modal de edição quando não está criando', () => {
    component.openEditModal(baseOrder);
    component.isCreating.set(false);

    component.closeEditModal();

    expect(component.isEditModalOpen()).toBe(false);
    expect(component.orderToEdit()).toBeNull();
  });

  it('confirmEditOrder sucesso: deve atualizar, fechar modal e recarregar', () => {
    const payload = {
      codigo: 'ITUB4',
      quantidade: 10,
      valor: 30,
      data: '2024-04-01',
      tipo: 'ACAO' as const,
      operacao: 'Compra' as const,
    };
    const updatedOrder: Order = { ...baseOrder, codigo: 'ITUB4' };
    ordersServiceMock.updateOrder.mockReturnValue(of(updatedOrder));
    ordersServiceMock.getOrders.mockReturnValue(of({ ...defaultResponse, data: [updatedOrder] }));
    component.openEditModal(baseOrder);
    const getOrdersCallsBefore = ordersServiceMock.getOrders.mock.calls.length;

    component.confirmEditOrder(payload);

    expect(ordersServiceMock.updateOrder).toHaveBeenCalledWith('1', payload);
    expect(component.isCreating()).toBe(false);
    expect(component.isEditModalOpen()).toBe(false);
    expect(component.orderToEdit()).toBeNull();
    expect(ordersServiceMock.getOrders.mock.calls.length).toBe(getOrdersCallsBefore + 1);
  });

  it('confirmEditOrder erro: deve setar alerta de erro', () => {
    const payload = {
      codigo: 'ITUB4',
      quantidade: 10,
      valor: 30,
      data: '2024-04-01',
      tipo: 'ACAO' as const,
      operacao: 'Compra' as const,
    };
    ordersServiceMock.updateOrder.mockReturnValue(throwError(() => new Error('erro')));
    component.openEditModal(baseOrder);

    component.confirmEditOrder(payload);

    expect(component.isCreating()).toBe(false);
    expect(component.isEditModalOpen()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível adicionar a ordem.');
  });

  it('confirmEditOrder sem orderToEdit: não deve chamar service', () => {
    const payload = {
      codigo: 'ITUB4',
      quantidade: 10,
      valor: 30,
      data: '2024-04-01',
      tipo: 'ACAO' as const,
      operacao: 'Compra' as const,
    };
    component.orderToEdit.set(null);

    component.confirmEditOrder(payload);

    expect(ordersServiceMock.updateOrder).not.toHaveBeenCalled();
  });
});
