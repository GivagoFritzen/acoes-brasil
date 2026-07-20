import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { PortfolioItem } from '../../models';
import type { CreatePortfolioPayload } from '../../models/CreatePortfolioPayloadModel';
import { PortfolioService } from '../../services/PortfolioService';
import { AcoesComponent } from './AcoesComponent';
import { Router } from '@angular/router';

describe('AcoesComponent', () => {
  let component: AcoesComponent;
  let portfolioServiceMock: {
    getPortfolios: ReturnType<typeof vi.fn>;
    createPortfolio: ReturnType<typeof vi.fn>;
    deletePortfolio: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  const basePortfolio: PortfolioItem = {
    id: '1',
    codigo: 'PETR4',
    quantidade: 10,
    precoMedio: 30.5,
  };

  beforeEach(async () => {
    portfolioServiceMock = {
      getPortfolios: vi.fn(),
      createPortfolio: vi.fn(),
      deletePortfolio: vi.fn(),
    };
    portfolioServiceMock.getPortfolios.mockReturnValue(of([basePortfolio]));

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AcoesComponent],
      providers: [
        { provide: PortfolioService, useValue: portfolioServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AcoesComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar portfolios no ngOnInit', () => {
    component.ngOnInit();

    expect(portfolioServiceMock.getPortfolios).toHaveBeenCalled();
    expect(component.portfolios()).toEqual([basePortfolio]);
    expect(component.isLoading()).toBe(false);
  });

  it('deve carregar portfolios com sucesso', () => {
    const portfolioList: PortfolioItem[] = [
      { id: '1', codigo: 'PETR4', quantidade: 10, precoMedio: 30 },
      { id: '2', codigo: 'VALE5', quantidade: 5, precoMedio: 70 },
    ];
    portfolioServiceMock.getPortfolios.mockReturnValue(of(portfolioList));

    component.loadPortfolios();

    expect(component.portfolios()).toEqual(portfolioList);
    expect(component.isLoading()).toBe(false);
  });

  it('deve tratar erro ao carregar portfolios', () => {
    portfolioServiceMock.getPortfolios.mockReturnValue(throwError(() => new Error('erro')));

    component.loadPortfolios();

    expect(component.errorMessage()).toBe('Não foi possível carregar os portfolios.');
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível carregar os portfolios.');
    expect(component.isLoading()).toBe(false);
  });

  it('deve remover alert específico no handleAlertDismiss', () => {
    const alert = { variant: 'info', title: 'Sucesso', message: 'ok', icon: '✓' } as const;
    component.alerts.set([
      alert,
      { variant: 'error', title: 'Erro', message: 'falhou', icon: '✕' },
    ]);

    component.handleAlertDismiss(alert);

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
  });

  it('deve abrir modal de criação', () => {
    component.openCreateModal();

    expect(component.isCreateModalOpen()).toBe(true);
  });

  it('deve alternar modo edit', () => {
    expect(component.isEditing()).toBe(false);

    component.toggleEditMode();

    expect(component.isEditing()).toBe(true);
  });

  it('deve alternar modo edit de volta para false', () => {
    component.isEditing.set(true);

    component.toggleEditMode();

    expect(component.isEditing()).toBe(false);
  });

  it('deve alternar modo delete', () => {
    expect(component.isDeleteMode()).toBe(false);

    component.toggleDeleteMode();

    expect(component.isDeleteMode()).toBe(true);
  });

  it('deve alternar modo delete para false e fechar modal de deleção', () => {
    component.isDeleteMode.set(true);
    component.isDeleteModalOpen.set(true);

    component.toggleDeleteMode();

    expect(component.isDeleteMode()).toBe(false);
    expect(component.isDeleteModalOpen()).toBe(false);
  });

  it('deve abrir modal de deleção com item', () => {
    component.openDeleteModal(basePortfolio);

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.portfolioToDelete()).toEqual(basePortfolio);
  });

  it('deve fechar modal de deleção quando não está deletando', () => {
    component.openDeleteModal(basePortfolio);
    component.isDeleting.set(false);

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.portfolioToDelete()).toBeNull();
  });

  it('não deve fechar modal de deleção durante deleção', () => {
    component.openDeleteModal(basePortfolio);
    component.isDeleting.set(true);

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.portfolioToDelete()).toEqual(basePortfolio);
  });

  it('deve fechar modal de criação quando não está criando', () => {
    component.openCreateModal();
    component.isCreating.set(false);

    component.closeCreateModal();

    expect(component.isCreateModalOpen()).toBe(false);
  });

  it('não deve fechar modal de criação durante criação', () => {
    component.openCreateModal();
    component.isCreating.set(true);

    component.closeCreateModal();

    expect(component.isCreateModalOpen()).toBe(true);
  });

  it('deve criar portfolio com sucesso', () => {
    const payload: CreatePortfolioPayload = {
      codigo: 'ITUB4',
      quantidade: 10,
      precoMedio: 30,
    };
    const createdPortfolio: PortfolioItem = { id: '2', codigo: 'ITUB4', quantidade: 10, precoMedio: 30 };
    portfolioServiceMock.createPortfolio.mockReturnValue(of(createdPortfolio));
    component.openCreateModal();
    const getPortfoliosCallsBefore = portfolioServiceMock.getPortfolios.mock.calls.length;

    component.confirmCreatePortfolio(payload);

    expect(portfolioServiceMock.createPortfolio).toHaveBeenCalledWith(payload);
    expect(component.isCreating()).toBe(false);
    expect(component.isCreateModalOpen()).toBe(false);
    expect(portfolioServiceMock.getPortfolios.mock.calls.length).toBe(getPortfoliosCallsBefore + 1);
  });

  it('deve tratar erro ao criar portfolio', () => {
    const payload: CreatePortfolioPayload = {
      codigo: 'ITUB4',
      quantidade: 10,
      precoMedio: 30,
    };
    portfolioServiceMock.createPortfolio.mockReturnValue(throwError(() => new Error('erro')));

    component.confirmCreatePortfolio(payload);

    expect(component.isCreating()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível adicionar o ativo ao portfólio.');
  });

  it('deve deletar portfolio com sucesso', () => {
    portfolioServiceMock.deletePortfolio.mockReturnValue(of({ message: 'ok' }));
    component.openDeleteModal(basePortfolio);
    const getPortfoliosCallsBefore = portfolioServiceMock.getPortfolios.mock.calls.length;

    component.confirmDeletePortfolio();

    expect(portfolioServiceMock.deletePortfolio).toHaveBeenCalledWith('1');
    expect(component.isDeleting()).toBe(false);
    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.portfolioToDelete()).toBeNull();
    expect(portfolioServiceMock.getPortfolios.mock.calls.length).toBe(getPortfoliosCallsBefore + 1);
  });

  it('deve tratar erro ao deletar portfolio', () => {
    portfolioServiceMock.deletePortfolio.mockReturnValue(throwError(() => new Error('erro')));
    component.openDeleteModal(basePortfolio);

    component.confirmDeletePortfolio();

    expect(component.isDeleting()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível deletar o ativo do portfólio.');
  });

  it('deve navegar para detalhes quando não está em modo delete', () => {
    component.isDeleteMode.set(false);

    component.goToPortfolioDetails(basePortfolio);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/acoes', 'PETR4']);
  });

  it('deve navegar para detalhes quando está em modo delete', () => {
    component.isDeleteMode.set(true);

    component.goToPortfolioDetails(basePortfolio);

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('confirmDeletePortfolio sem portfolioToDelete: não deve chamar service', () => {
    component.portfolioToDelete.set(null);
    component.confirmDeletePortfolio();

    expect(portfolioServiceMock.deletePortfolio).not.toHaveBeenCalled();
  });

  it('deve aplicar response undefined como array vazio', () => {
    portfolioServiceMock.getPortfolios.mockReturnValue(of(undefined! as PortfolioItem[]));

    component.loadPortfolios();

    expect(component.portfolios()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });

  describe('mergePortfolios', () => {
    it('deve mesclar VALE3 e VALE3F em uma unica linha ao carregar portfolios', () => {
      const items: PortfolioItem[] = [
        { id: '1', codigo: 'VALE3', quantidade: 100, precoMedio: 40 },
        { id: '2', codigo: 'VALE3F', quantidade: 50, precoMedio: 42 },
      ];
      portfolioServiceMock.getPortfolios.mockReturnValue(of(items));

      component.loadPortfolios();

      expect(component.portfolios()).toHaveLength(1);
      expect(component.portfolios()[0].codigo).toBe('VALE3');
      expect(component.portfolios()[0].quantidade).toBe(150);
    });

    it('deve calcular preco medio ponderado ao mesclar VALE3 e VALE3F', () => {
      const items: PortfolioItem[] = [
        { id: '1', codigo: 'VALE3', quantidade: 100, precoMedio: 40 },
        { id: '2', codigo: 'VALE3F', quantidade: 50, precoMedio: 42 },
      ];
      portfolioServiceMock.getPortfolios.mockReturnValue(of(items));
      const precoEsperado = (100 * 40 + 50 * 42) / 150;

      component.loadPortfolios();

      expect(component.portfolios()[0].precoMedio).toBe(precoEsperado);
    });

    it('deve manter codigos diferentes separados quando nao ha F', () => {
      const items: PortfolioItem[] = [
        { id: '1', codigo: 'PETR4', quantidade: 100, precoMedio: 30 },
        { id: '2', codigo: 'VALE5', quantidade: 50, precoMedio: 70 },
      ];
      portfolioServiceMock.getPortfolios.mockReturnValue(of(items));

      component.loadPortfolios();

      expect(component.portfolios()).toHaveLength(2);
      expect(component.portfolios()[0].codigo).toBe('PETR4');
      expect(component.portfolios()[1].codigo).toBe('VALE5');
    });

    it('deve manter PETR4 inalterado quando nao ha codigo com F correspondente', () => {
      const items: PortfolioItem[] = [
        { id: '1', codigo: 'PETR4', quantidade: 100, precoMedio: 30 },
      ];
      portfolioServiceMock.getPortfolios.mockReturnValue(of(items));

      component.loadPortfolios();

      expect(component.portfolios()).toHaveLength(1);
      expect(component.portfolios()[0].codigo).toBe('PETR4');
      expect(component.portfolios()[0].quantidade).toBe(100);
    });

    it('deve deletar usando primeiro ID do grupo mesclado ao confirmar delecao', () => {
      portfolioServiceMock.getPortfolios.mockReturnValue(of([
        { id: '1', codigo: 'VALE3', quantidade: 100, precoMedio: 40 },
        { id: '2', codigo: 'VALE3F', quantidade: 50, precoMedio: 42 },
      ]));
      component.loadPortfolios();
      portfolioServiceMock.deletePortfolio.mockReturnValue(of({ message: 'ok' }));

      component.openDeleteModal(component.portfolios()[0]);
      component.confirmDeletePortfolio();

      expect(portfolioServiceMock.deletePortfolio).toHaveBeenCalledWith('1');
    });
  });
});