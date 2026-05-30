import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { FundamentusAcaoDetails, FundamentusIndicator, ProventosResponse } from '../../../models';
import { FundamentusService } from '../../../services/FundamentusService';
import { ProventosService } from '../../../services/ProventosService';
import { TranslationService } from '../../../services/TranslationService';
import { AcaoDetailsComponent } from './AcaoDetailsComponent';

describe('AcaoDetailsComponent', () => {
  let component: AcaoDetailsComponent;
  let fundamentusServiceMock: { getAcaoDetails: ReturnType<typeof vi.fn> };
  let proventosServiceMock: { getProventos: ReturnType<typeof vi.fn> };
  let translationServiceMock: {
    get: ReturnType<typeof vi.fn>;
    has: ReturnType<typeof vi.fn>;
  };
  let routeMock: any;

  const baseIndicator: FundamentusIndicator = {
    label: 'P/L',
    value: '10.5',
  };

  const baseFundamentus: FundamentusAcaoDetails = {
    codigo: 'PETR4',
    empresa: 'Petrobras',
    setor: 'Petroleo',
    subsetor: 'Exploracao',
    indicadores: [baseIndicator],
    updatedAt: '2024-01-01',
  };

  const baseProventos: ProventosResponse = {
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  beforeEach(async () => {
    fundamentusServiceMock = {
      getAcaoDetails: vi.fn(),
    };
    proventosServiceMock = {
      getProventos: vi.fn(),
    };
    translationServiceMock = {
      get: vi.fn((key: string) => key),
      has: vi.fn((key: string) => false),
    };
    routeMock = {
      paramMap: {
        subscribe: vi.fn((callback: (params: { get: (key: string) => string | null }) => void) => {
          callback({ get: (key: string) => (key === 'codigo' ? 'PETR4' : null) });
        }),
      },
    };

    fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(baseFundamentus));
    proventosServiceMock.getProventos.mockReturnValue(of(baseProventos));

    await TestBed.configureTestingModule({
      imports: [AcaoDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: FundamentusService, useValue: fundamentusServiceMock },
        { provide: ProventosService, useValue: proventosServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AcaoDetailsComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar detalhes no ngOnInit com código válido', () => {
    component.ngOnInit();

    expect(fundamentusServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
    expect(proventosServiceMock.getProventos).toHaveBeenCalledWith({ codigo: 'PETR4', limit: 10 });
    expect(component.fundamentus()).toEqual(baseFundamentus);
    expect(component.proventos()).toEqual(baseProventos);
    expect(component.isLoading()).toBe(false);
  });

  it('deve carregar detalhes no ngOnInit sem código', () => {
    routeMock.paramMap = {
      subscribe: vi.fn((callback: (params: { get: (key: string) => string | null }) => void) => {
        callback({ get: (key: string) => null });
      }),
    };
    const fixture = TestBed.createComponent(AcaoDetailsComponent);
    const componentWithoutCode = fixture.componentInstance;

    componentWithoutCode.ngOnInit();

    expect(fundamentusServiceMock.getAcaoDetails).not.toHaveBeenCalled();
    expect(componentWithoutCode.errorMessage()).toBe('acaoDetails.errors.codeNotProvided');
  });

  it('deve carregar fundamentus com sucesso', () => {
    component.fundamentus.set(null);
    fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(baseFundamentus));

    component['loadAcaoDetails']('VALE5');

    expect(component.fundamentus()).toEqual(baseFundamentus);
    expect(component.isLoading()).toBe(false);
  });

  it('deve tratar erro ao carregar fundamentus', () => {
    fundamentusServiceMock.getAcaoDetails.mockReturnValue(throwError(() => new Error('erro')));

    component['loadAcaoDetails']('PETR4');

    expect(component.fundamentus()).toBeNull();
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('warning');
  });

  it('deve carregar proventos com sucesso', () => {
    component.proventos.set(null);
    proventosServiceMock.getProventos.mockReturnValue(of(baseProventos));

    component['loadAcaoDetails']('PETR4');

    expect(component.proventos()).toEqual(baseProventos);
  });

  it('deve tratar erro ao carregar proventos', () => {
    proventosServiceMock.getProventos.mockReturnValue(throwError(() => new Error('erro')));

    component['loadAcaoDetails']('PETR4');

    expect(component.proventos()).toBeNull();
    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('warning');
  });

  it('deve remover alert no handleAlertDismiss', () => {
    const alert = { variant: 'info', title: 'Sucesso', message: 'ok', icon: '✓' } as const;
    component.alerts.set([
      alert,
      { variant: 'error', title: 'Erro', message: 'falhou', icon: '✕' },
    ]);

    component.handleAlertDismiss(alert);

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('error');
  });

  it('deve retornar indicador válido no getIndicator', () => {
    const result = component.getIndicator(baseFundamentus, 'P/L');

    expect(result).toBe('10.5');
  });

  it('deve retornar null para indicador inválido', () => {
    const result = component.getIndicator(baseFundamentus, 'Inexistente');

    expect(result).toBeNull();
  });

  it('deve normalizar labels corretamente', () => {
    translationServiceMock.has.mockReturnValue(true);
    translationServiceMock.get.mockReturnValue('Help text');

    expect(component.hasHelp('P/L')).toBe(true);
    expect(component.getHelp('P/L')).toBe('Help text');
  });

  it('deve verificar se tem help', () => {
    translationServiceMock.has.mockReturnValue(false);

    const result = component.hasHelp('P/L');

    expect(result).toBe(false);
    expect(translationServiceMock.has).toHaveBeenCalledWith('fundamentus.indicators.PL');
  });

  it('deve retornar help text', () => {
    translationServiceMock.has.mockReturnValue(true);
    translationServiceMock.get.mockReturnValue('Help text');

    const result = component.getHelp('P/L');

    expect(result).toBe('Help text');
    expect(translationServiceMock.get).toHaveBeenCalledWith('fundamentus.indicators.PL');
  });

  it('deve setar error e alert quando fundamentus é null', () => {
    fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(null));

    component['loadAcaoDetails']('PETR4');

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('warning');
  });

  it('deve setar warning quando proventos é null', () => {
    proventosServiceMock.getProventos.mockReturnValue(of(null));

    component['loadAcaoDetails']('PETR4');

    expect(component.alerts().length).toBe(1);
    expect(component.alerts()[0].variant).toBe('warning');
  });

  it('deve setar ambos os warnings quando fundamentus e proventos são null', () => {
    fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(null));
    proventosServiceMock.getProventos.mockReturnValue(of(null));

    component['loadAcaoDetails']('PETR4');

    expect(component.alerts().length).toBe(2);
  });

  it('deve normalizar labels com caracteres especiais', () => {
    translationServiceMock.has.mockReturnValue(true);
    translationServiceMock.get.mockReturnValue('help');

    component.hasHelp('P/L (12m)');
    expect(translationServiceMock.has).toHaveBeenCalledWith('fundamentus.indicators.PL12m');
  });
});