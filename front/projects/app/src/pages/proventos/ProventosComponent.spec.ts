import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import type { Provento, ProventosResponse } from '../../models';
import type { CreateProventoPayload } from '../../models/CreateProventoPayloadModel';
import { ProventosService } from '../../services/ProventosService';
import { TranslationService } from '../../services/TranslationService';
import { ProventosComponent } from './ProventosComponent';

describe('ProventosComponent', () => {
  let component: ProventosComponent;
  let proventosServiceMock: {
    getProventos: ReturnType<typeof vi.fn>;
    createProvento: ReturnType<typeof vi.fn>;
    deleteProvento: ReturnType<typeof vi.fn>;
    deleteProventosByCodigo: ReturnType<typeof vi.fn>;
    updateProvento: ReturnType<typeof vi.fn>;
  };
  let mockTranslationService: { get: ReturnType<typeof vi.fn> };

  const baseProvento: Provento = {
    id: '1',
    codigo: 'PETR4',
    tipo: 'Dividendo',
    data: '2024-01-15',
    instituicao: 'Banco do Brasil',
    quantidade: 100,
    precoUnitario: 5,
    valorLiquido: 500,
  };

  const defaultResponse: ProventosResponse = {
    data: [baseProvento],
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    proventosServiceMock = {
      getProventos: vi.fn(),
      createProvento: vi.fn(),
      deleteProvento: vi.fn(),
      deleteProventosByCodigo: vi.fn(),
      updateProvento: vi.fn(),
    };
    proventosServiceMock.getProventos.mockReturnValue(of(defaultResponse));

    mockTranslationService = {
      get: vi.fn().mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'common.alerts.error': 'Erro',
          'common.alerts.success': 'Sucesso',
          'proventos.filterDividendo': 'Dividendo',
          'proventos.filterJcp': 'JCP',
          'proventos.filterRendimento': 'Rendimento',
          'proventos.alerts.loadFailed': 'Não foi possível carregar os proventos.',
          'proventos.alerts.createFailed': 'Não foi possível adicionar o provento.',
          'proventos.alerts.deleteFailed': 'Não foi possível deletar o provento.',
          'proventos.alerts.created': 'Provento adicionado com sucesso.',
          'proventos.alerts.deletedGroup': 'Proventos removidos com sucesso.',
          'proventos.alerts.deletedSingle': 'Provento removido com sucesso.',
          'proventos.alerts.updated': 'Provento atualizado com sucesso.',
        };
        return translations[key] ?? '';
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ProventosComponent],
      providers: [
        { provide: ProventosService, useValue: proventosServiceMock },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProventosComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar proventos no ngOnInit', () => {
    component.ngOnInit();

    expect(proventosServiceMock.getProventos).toHaveBeenCalledWith({
      codigo: undefined,
      tipo: undefined,
      dataInicial: undefined,
      dataFinal: undefined,
      agruparPorCodigo: false,
      page: 1,
      limit: 10,
    });
    expect(component.proventos()).toEqual([baseProvento]);
    expect(component.page()).toBe(1);
    expect(component.totalPages()).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('deve carregar proventos com sucesso', () => {
    const proventosList: Provento[] = [
      { id: '1', codigo: 'PETR4', tipo: 'Dividendo', data: '2024-01-15', instituicao: 'BB', quantidade: 10, precoUnitario: 5, valorLiquido: 50 },
      { id: '2', codigo: 'VALE5', tipo: 'JurosSobreCapitalProprio', data: '2024-02-20', instituicao: 'Itau', quantidade: 5, precoUnitario: 5, valorLiquido: 25 },
    ];
    proventosServiceMock.getProventos.mockReturnValue(of({
      data: proventosList,
      page: 2,
      limit: 5,
      total: 2,
      totalPages: 1,
    }));

    component['loadProventos']();

    expect(component.proventos()).toEqual(proventosList);
    expect(component.page()).toBe(2);
    expect(component.limit()).toBe(5);
    expect(component.totalPages()).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('deve tratar erro ao carregar proventos', () => {
    proventosServiceMock.getProventos.mockReturnValue(throwError(() => new Error('erro')));

    component['loadProventos']();

    expect(component.errorMessage()).toBe('Não foi possível carregar os proventos.');
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível carregar os proventos.');
    expect(component.isLoading()).toBe(false);
  });

  it('deve setar filtro de data inicial', () => {
    component.handleFilterStartChange('2024-01-10');
    expect(component.filtroData()).toBe('2024-01-10');
  });

  it('deve setar filtro de código', () => {
    component.handleFilterCodeChange('petr4');
    expect(component.filtroCodigo()).toBe('petr4');
  });

  it('deve setar filtro de tipo', () => {
    component.handleFilterTypeChange('Dividendo');
    expect(component.filtroTipo()).toBe('Dividendo');
  });

  it('deve setar filtro de tipo inválido como vazio', () => {
    component.handleFilterTypeChange('Invalido');
    expect(component.filtroTipo()).toBe('');
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

  it('deve alternar agrupamento por código e resetar página', () => {
    component.page.set(5);
    component.handleJuntarPorCodigoChange(true);
    expect(component.juntarPorCodigo()).toBe(true);
    expect(component.page()).toBe(1);
  });

  it('deve aplicar filtros e recarregar', () => {
    component.page.set(3);
    component.handleFilterCodeChange('vale3');
    component.handleFilterTypeChange('Dividendo');
    component.handleFilterStartChange('2024-02-01');
    component.handleFilterEndChange('2024-02-28');
    component.handleJuntarPorCodigoChange(true);

    component.applyFilter();

    expect(component.page()).toBe(1);
    expect(component.filtroCodigoAplicado()).toBe('vale3');
    expect(component.filtroTipoAplicado()).toBe('Dividendo');
    expect(component.filtroDataAplicado()).toBe('2024-02-01');
    expect(component.filtroDataFinalAplicado()).toBe('2024-02-28');
    expect(proventosServiceMock.getProventos).toHaveBeenCalledWith({
      codigo: 'vale3',
      tipo: 'Dividendo',
      dataInicial: '2024-02-01',
      dataFinal: '2024-02-28',
      agruparPorCodigo: true,
      page: 1,
      limit: 10,
    });
  });

  it('deve limpar filtros e recarregar', () => {
    component.handleFilterCodeChange('bbas3');
    component.handleFilterTypeChange('Rendimento');
    component.handleFilterStartChange('2024-03-01');
    component.handleFilterEndChange('2024-03-10');
    component.handleJuntarPorCodigoChange(true);
    component.applyFilter();

    component.page.set(2);
    component.clearFilter();

    expect(component.filtroCodigo()).toBe('');
    expect(component.filtroTipo()).toBe('');
    expect(component.filtroData()).toBe('');
    expect(component.filtroDataFinal()).toBe('');
    expect(component.filtroCodigoAplicado()).toBe('');
    expect(component.filtroTipoAplicado()).toBe('');
    expect(component.filtroDataAplicado()).toBe('');
    expect(component.filtroDataFinalAplicado()).toBe('');
    expect(component.juntarPorCodigo()).toBe(false);
    expect(component.page()).toBe(1);
  });

  it('previousPage não deve fazer nada na primeira página', () => {
    component.page.set(1);
    const callsBefore = proventosServiceMock.getProventos.mock.calls.length;

    component.previousPage();

    expect(component.page()).toBe(1);
    expect(proventosServiceMock.getProventos.mock.calls.length).toBe(callsBefore);
  });

it('previousPage deve tentar decrementar e carregar proventos', () => {
    component.page.set(3);
    proventosServiceMock.getProventos.mockReturnValue(of({ ...defaultResponse, page: 2 }));
    component.previousPage();

    expect(component.page()).toBe(2);
    expect(proventosServiceMock.getProventos).toHaveBeenCalled();
  });

  it('nextPage deve tentar incrementar e carregar proventos', () => {
    component.page.set(1);
    component.totalPages.set(3);
    const getProventosCallsBefore = proventosServiceMock.getProventos.mock.calls.length;

    component.nextPage();

    expect(proventosServiceMock.getProventos.mock.calls.length).toBe(getProventosCallsBefore + 1);
  });

  it('nextPage não deve fazer nada na última página', () => {
    component.page.set(2);
    component.totalPages.set(2);
    const callsBefore = proventosServiceMock.getProventos.mock.calls.length;

    component.nextPage();

    expect(component.page()).toBe(2);
    expect(proventosServiceMock.getProventos.mock.calls.length).toBe(callsBefore);
  });

  it('nextPage deve tentar incrementar e carregar proventos', () => {
    component.page.set(1);
    component.totalPages.set(3);
    const getProventosCallsBefore = proventosServiceMock.getProventos.mock.calls.length;

    component.nextPage();

    expect(proventosServiceMock.getProventos.mock.calls.length).toBe(getProventosCallsBefore + 1);
  });

  it('deve remover alerta no handleAlertDismiss', () => {
    const alert = { variant: 'info', title: 'Sucesso', message: 'ok', icon: '✓' } as const;
    component.alerts.set([
      alert,
      { variant: 'error', title: 'Erro', message: 'falhou', icon: '✕' },
    ]);

    component.handleAlertDismiss(alert);

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
  });

  it('deve formatar tipo Dividendo corretamente', () => {
    expect(component.formatTipo('Dividendo')).toBe('Dividendo');
  });

  it('deve formatar tipo JCP corretamente', () => {
    expect(component.formatTipo('JurosSobreCapitalProprio')).toBe('JCP');
  });

  it('deve formatar tipo Rendimento corretamente', () => {
    expect(component.formatTipo('Rendimento')).toBe('Rendimento');
  });

  it('trackByProventoId deve retornar id do item', () => {
    expect(component.trackByProventoId(0, baseProvento)).toBe('1');
  });

  it('deve abrir modal de deleção e setar provento alvo', () => {
    component.openDeleteModal(baseProvento);

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.proventoToDelete()).toEqual(baseProvento);
  });

  it('deve abrir modal de criação', () => {
    component.openCreateModal();
    expect(component.isCreateModalOpen()).toBe(true);
  });

  it('não deve fechar modal de deleção durante deleção', () => {
    component.openDeleteModal(baseProvento);
    component.isDeleting.set(true);

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(true);
    expect(component.proventoToDelete()).toEqual(baseProvento);
  });

  it('deve fechar modal de deleção quando não está deletando', () => {
    component.openDeleteModal(baseProvento);
    component.isDeleting.set(false);

    component.closeDeleteModal();

    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.proventoToDelete()).toBeNull();
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

  it('confirmCreateProvento sucesso: deve criar, fechar modal, alertar e recarregar', () => {
    const payload: CreateProventoPayload = {
      codigo: 'ITUB4',
      tipo: 'Dividendo',
      data: '2024-04-01',
      instituicao: 'Banco do Brasil',
      quantidade: 10,
      precoUnitario: 5,
      valorLiquido: 50,
    };
    const createdProvento: Provento = { ...baseProvento, id: '2', codigo: 'ITUB4' };
    proventosServiceMock.createProvento.mockReturnValue(of(createdProvento));
    proventosServiceMock.getProventos.mockReturnValue(of({ ...defaultResponse, data: [createdProvento] }));
    component.openCreateModal();

    component.confirmCreateProvento(payload);

    expect(proventosServiceMock.createProvento).toHaveBeenCalledWith(payload);
    expect(component.isCreating()).toBe(false);
    expect(proventosServiceMock.getProventos).toHaveBeenCalled();
  });

  it('confirmCreateProvento erro: deve setar alerta de erro', () => {
    const payload: CreateProventoPayload = {
      codigo: 'ITUB4',
      tipo: 'Dividendo',
      data: '2024-04-01',
      instituicao: 'Banco do Brasil',
      quantidade: 10,
      precoUnitario: 5,
      valorLiquido: 50,
    };
    proventosServiceMock.createProvento.mockReturnValue(throwError(() => new Error('erro')));

    component.confirmCreateProvento(payload);

    expect(component.isCreating()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível adicionar o provento.');
  });

  it('confirmDeleteProvento sem proventoToDelete: não deve chamar service', () => {
    component.proventoToDelete.set(null);
    component.confirmDeleteProvento();

    expect(proventosServiceMock.deleteProvento).not.toHaveBeenCalled();
  });

  it('confirmDeleteProvento sucesso: deve deletar, fechar modal, alertar e recarregar', () => {
    proventosServiceMock.deleteProvento.mockReturnValue(of({ message: 'ok' }));
    proventosServiceMock.getProventos.mockReturnValue(of({ ...defaultResponse, data: [] }));
    component.openDeleteModal(baseProvento);

    component.confirmDeleteProvento();

    expect(proventosServiceMock.deleteProvento).toHaveBeenCalledWith('1');
    expect(component.isDeleting()).toBe(false);
    expect(proventosServiceMock.getProventos).toHaveBeenCalled();
  });

  it('confirmDeleteProvento erro: deve setar alerta de erro', () => {
    proventosServiceMock.deleteProvento.mockReturnValue(throwError(() => new Error('erro')));
    component.openDeleteModal(baseProvento);

    component.confirmDeleteProvento();

    expect(component.isDeleting()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível deletar o provento.');
  });

  it('deve aplicar response com data indefinida como array vazio', () => {
    proventosServiceMock.getProventos.mockReturnValue(
      of({
        data: undefined! as Provento[],
        page: 2,
        limit: 5,
        total: 0,
        totalPages: 4,
      }),
    );

    component['loadProventos']();

    expect(component.proventos()).toEqual([]);
    expect(component.page()).toBe(2);
    expect(component.limit()).toBe(5);
    expect(component.totalPages()).toBe(4);
  });

  it('handleFilterTypeChange deve aceitar string vazia', () => {
    component.handleFilterTypeChange('');
    expect(component.filtroTipo()).toBe('');
  });

  it('deve abrir modal de edição e setar provento alvo', () => {
    component.openEditModal(baseProvento);

    expect(component.isEditModalOpen()).toBe(true);
    expect(component.proventoToEdit()).toEqual(baseProvento);
  });

  it('não deve fechar modal de edição durante criação', () => {
    component.openEditModal(baseProvento);
    component.isCreating.set(true);

    component.closeEditModal();

    expect(component.isEditModalOpen()).toBe(true);
    expect(component.proventoToEdit()).toEqual(baseProvento);
  });

  it('deve fechar modal de edição quando não está criando', () => {
    component.openEditModal(baseProvento);
    component.isCreating.set(false);

    component.closeEditModal();

    expect(component.isEditModalOpen()).toBe(false);
    expect(component.proventoToEdit()).toBeNull();
  });

  it('confirmEditProvento sucesso: deve atualizar, fechar modal e recarregar', () => {
    const payload = {
      codigo: 'ITUB4',
      tipo: 'Dividendo' as const,
      data: '2024-04-01',
      instituicao: 'Banco do Brasil',
      quantidade: 10,
      precoUnitario: 5,
      valorLiquido: 50,
    };
    const updatedProvento: Provento = { ...baseProvento, codigo: 'ITUB4' };
    proventosServiceMock.updateProvento.mockReturnValue(of(updatedProvento));
    proventosServiceMock.getProventos.mockReturnValue(of({ ...defaultResponse, data: [updatedProvento] }));
    component.openEditModal(baseProvento);
    const getProventosCallsBefore = proventosServiceMock.getProventos.mock.calls.length;

    component.confirmEditProvento(payload);

    expect(proventosServiceMock.updateProvento).toHaveBeenCalledWith('1', payload);
    expect(component.isCreating()).toBe(false);
    expect(component.isEditModalOpen()).toBe(false);
    expect(component.proventoToEdit()).toBeNull();
    expect(proventosServiceMock.getProventos.mock.calls.length).toBe(getProventosCallsBefore + 1);
  });

  it('confirmEditProvento erro: deve setar alerta de erro', () => {
    const payload = {
      codigo: 'ITUB4',
      tipo: 'Dividendo' as const,
      data: '2024-04-01',
      instituicao: 'Banco do Brasil',
      quantidade: 10,
      precoUnitario: 5,
      valorLiquido: 50,
    };
    proventosServiceMock.updateProvento.mockReturnValue(throwError(() => new Error('erro')));
    component.openEditModal(baseProvento);

    component.confirmEditProvento(payload);

    expect(component.isCreating()).toBe(false);
    expect(component.isEditModalOpen()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível adicionar o provento.');
  });

  it('confirmEditProvento sem proventoToEdit: não deve chamar service', () => {
    const payload = {
      codigo: 'ITUB4',
      tipo: 'Dividendo' as const,
      data: '2024-04-01',
      instituicao: 'Banco do Brasil',
      quantidade: 10,
      precoUnitario: 5,
      valorLiquido: 50,
    };
    component.proventoToEdit.set(null);

    component.confirmEditProvento(payload);

    expect(proventosServiceMock.updateProvento).not.toHaveBeenCalled();
  });

  it('confirmDeleteProvento com juntarPorCodigo: deve deletar por código', () => {
    proventosServiceMock.deleteProventosByCodigo.mockReturnValue(of({ message: 'ok' }));
    proventosServiceMock.getProventos.mockReturnValue(of({ ...defaultResponse, data: [] }));
    component.juntarPorCodigo.set(true);
    component.openDeleteModal(baseProvento);
    const getProventosCallsBefore = proventosServiceMock.getProventos.mock.calls.length;

    component.confirmDeleteProvento();

    expect(proventosServiceMock.deleteProventosByCodigo).toHaveBeenCalledWith('PETR4');
    expect(proventosServiceMock.deleteProvento).not.toHaveBeenCalled();
    expect(component.isDeleting()).toBe(false);
    expect(component.isDeleteModalOpen()).toBe(false);
    expect(component.proventoToDelete()).toBeNull();
    expect(proventosServiceMock.getProventos.mock.calls.length).toBe(getProventosCallsBefore + 1);
  });

  it('confirmDeleteProvento com juntarPorCodigo erro: deve setar alerta de erro', () => {
    proventosServiceMock.deleteProventosByCodigo.mockReturnValue(throwError(() => new Error('erro')));
    component.juntarPorCodigo.set(true);
    component.openDeleteModal(baseProvento);

    component.confirmDeleteProvento();

    expect(component.isDeleting()).toBe(false);
    expect(component.alerts()[0].variant).toBe('error');
    expect(component.alerts()[0].message).toBe('Não foi possível deletar o provento.');
  });

  it('formatTipo com tipo desconhecido deve retornar o tipo original', () => {
    expect(component.formatTipo('TipoDesconhecido' as any)).toBe('TipoDesconhecido');
  });
});