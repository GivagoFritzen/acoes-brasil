import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { FundamentusAcaoDetails, FundamentusIndicator, ProventosResponse } from '../../../models';
import { FundamentusService } from '../../../services/FundamentusService';
import { GoogleFinanceService } from '../../../services/GoogleFinanceService';
import { ProventosService } from '../../../services/ProventosService';
import { TranslationService } from '../../../services/TranslationService';
import { AcaoDetailsComponent } from './AcaoDetailsComponent';
import type { GoogleFinanceResponse } from '../../../../../../../common/models/google-finance';

describe('AcaoDetailsComponent', () => {
  let component: AcaoDetailsComponent;
  let fundamentusServiceMock: { getAcaoDetails: ReturnType<typeof vi.fn> };
  let googleFinanceServiceMock: { getData: ReturnType<typeof vi.fn> };
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

  const baseGoogleFinance: GoogleFinanceResponse = {
    quote: {
      ticker: 'PETR4',
      exchange: 'BVMF',
      name: 'Petrobras',
      price: 42.5,
      change: 1.2,
      changePercent: 2.91,
      previousClose: 41.3,
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
    },
    chart: {
      previousClose: 41.3,
      points: [
        { timestamp: 1700000000000, date: '2024-01-01', price: 42.5, volume: 1000 },
      ],
    },
    updatedAt: '2024-01-01T12:00:00.000Z',
  };

  beforeEach(async () => {
    fundamentusServiceMock = {
      getAcaoDetails: vi.fn(),
    };
    googleFinanceServiceMock = {
      getData: vi.fn(),
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
      snapshot: {
        paramMap: {
          get: vi.fn((key: string) => (key === 'codigo' ? 'PETR4' : null)),
        },
      },
    };

    fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(baseFundamentus));
    proventosServiceMock.getProventos.mockReturnValue(of(baseProventos));
    googleFinanceServiceMock.getData.mockReturnValue(of(baseGoogleFinance));

    await TestBed.configureTestingModule({
      imports: [AcaoDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: FundamentusService, useValue: fundamentusServiceMock },
        { provide: GoogleFinanceService, useValue: googleFinanceServiceMock },
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

  describe('ngOnInit', () => {
    it('deve carregar detalhes com codigo valido', () => {
      component.ngOnInit();

      expect(fundamentusServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(proventosServiceMock.getProventos).toHaveBeenCalledWith({ codigo: 'PETR4', limit: 10 });
      expect(googleFinanceServiceMock.getData).toHaveBeenCalledWith('PETR4');
      expect(component.fundamentus()).toEqual(baseFundamentus);
      expect(component.proventos()).toEqual(baseProventos);
      expect(component.googleFinance()).toEqual(baseGoogleFinance);
      expect(component.isLoading()).toBe(false);
    });

    it('deve setar erro quando codigo for null', () => {
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
  });

  describe('loadAcaoDetails', () => {
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

    it('deve carregar googleFinance com sucesso', () => {
      component.googleFinance.set(null);
      googleFinanceServiceMock.getData.mockReturnValue(of(baseGoogleFinance));

      component['loadAcaoDetails']('PETR4');

      expect(component.googleFinance()).toEqual(baseGoogleFinance);
    });

    it('deve tratar erro ao carregar googleFinance e retornar null', () => {
      googleFinanceServiceMock.getData.mockReturnValue(throwError(() => new Error('erro')));

      component['loadAcaoDetails']('PETR4');

      expect(component.googleFinance()).toBeNull();
      expect(component.fundamentus()).toEqual(baseFundamentus);
      expect(component.proventos()).toEqual(baseProventos);
    });

    it('deve normalizar codigo para maiusculas e trim', () => {
      component['loadAcaoDetails']('  petr4  ');

      expect(fundamentusServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(proventosServiceMock.getProventos).toHaveBeenCalledWith({ codigo: 'PETR4', limit: 10 });
      expect(googleFinanceServiceMock.getData).toHaveBeenCalledWith('PETR4');
    });

    it('deve setar warning quando fundamentus e null', () => {
      fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(null));

      component['loadAcaoDetails']('PETR4');

      expect(component.alerts().length).toBe(1);
      expect(component.alerts()[0].variant).toBe('warning');
    });

    it('deve setar warning quando proventos e null', () => {
      proventosServiceMock.getProventos.mockReturnValue(of(null));

      component['loadAcaoDetails']('PETR4');

      expect(component.alerts().length).toBe(1);
      expect(component.alerts()[0].variant).toBe('warning');
    });

    it('deve manter googleFinance null sem warning quando retorna null (comportamento atual)', () => {
      googleFinanceServiceMock.getData.mockReturnValue(of(null));

      component['loadAcaoDetails']('PETR4');

      expect(component.googleFinance()).toBeNull();
      expect(component.alerts().length).toBe(0);
    });

    it('deve setar 2 warnings quando fundamentus e proventos retornam null', () => {
      fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(null));
      proventosServiceMock.getProventos.mockReturnValue(of(null));
      googleFinanceServiceMock.getData.mockReturnValue(of(null));

      component['loadAcaoDetails']('PETR4');

      expect(component.alerts().length).toBe(2);
    });

    it('deve carregar fundamentus e proventos mesmo quando googleFinance falha', () => {
      googleFinanceServiceMock.getData.mockReturnValue(throwError(() => new Error('erro')));

      component['loadAcaoDetails']('PETR4');

      expect(component.fundamentus()).toEqual(baseFundamentus);
      expect(component.proventos()).toEqual(baseProventos);
      expect(component.googleFinance()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('handleAlertDismiss', () => {
    it('deve remover alert correspondente', () => {
      const alert = { variant: 'info', title: 'Sucesso', message: 'ok', icon: '✓' } as const;
      component.alerts.set([
        alert,
        { variant: 'error', title: 'Erro', message: 'falhou', icon: '✕' },
      ]);

      component.handleAlertDismiss(alert);

      expect(component.alerts().length).toBe(1);
      expect(component.alerts()[0].variant).toBe('error');
    });

    it('deve manter todos os alerts quando nao encontra correspondencia', () => {
      const alert1 = { variant: 'info', title: 'A', message: 'a', icon: '!' } as const;
      const alert2 = { variant: 'error', title: 'B', message: 'b', icon: '✕' } as const;
      component.alerts.set([alert1, alert2]);

      component.handleAlertDismiss({ variant: 'warning', title: 'C', message: 'c', icon: '?' });

      expect(component.alerts().length).toBe(2);
    });
  });

  describe('getIndicator', () => {
    it('deve retornar valor do indicador quando encontrado', () => {
      const result = component.getIndicator(baseFundamentus, 'P/L');

      expect(result).toBe('10.5');
    });

    it('deve retornar null quando indicador nao encontrado', () => {
      const result = component.getIndicator(baseFundamentus, 'Inexistente');

      expect(result).toBeNull();
    });
  });

  describe('hasHelp / getHelp', () => {
    it('deve retornar true quando translationService.has retorna true', () => {
      translationServiceMock.has.mockReturnValue(true);

      expect(component.hasHelp('P/L')).toBe(true);
    });

    it('deve retornar false quando translationService.has retorna false', () => {
      translationServiceMock.has.mockReturnValue(false);

      const result = component.hasHelp('P/L');

      expect(result).toBe(false);
      expect(translationServiceMock.has).toHaveBeenCalledWith('fundamentus.indicators.PL');
    });

    it('deve retornar help text do translationService.get', () => {
      translationServiceMock.has.mockReturnValue(true);
      translationServiceMock.get.mockReturnValue('Help text');

      const result = component.getHelp('P/L');

      expect(result).toBe('Help text');
      expect(translationServiceMock.get).toHaveBeenCalledWith('fundamentus.indicators.PL');
    });
  });

  describe('changeChartWindow', () => {
    it('deve atualizar selectedChartWindow e buscar dados', () => {
      googleFinanceServiceMock.getData.mockReturnValue(of(baseGoogleFinance));

      component.changeChartWindow('5Y');

      expect(component.selectedChartWindow()).toBe('5Y');
      expect(googleFinanceServiceMock.getData).toHaveBeenCalledWith('PETR4', '5Y');
      expect(component.googleFinance()).toEqual(baseGoogleFinance);
    });

    it('deve retornar sem buscar quando nao ha codigo na rota', () => {
      routeMock.snapshot.paramMap.get = vi.fn(() => null);
      const fixture = TestBed.createComponent(AcaoDetailsComponent);
      const comp = fixture.componentInstance;

      comp.changeChartWindow('1M');

      expect(googleFinanceServiceMock.getData).not.toHaveBeenCalled();
    });

    it('deve exibir alert quando a chamada falha', () => {
      googleFinanceServiceMock.getData.mockReturnValue(throwError(() => new Error('erro')));

      component.changeChartWindow('MAX');

      expect(component.alerts().length).toBe(1);
      expect(component.alerts()[0].variant).toBe('warning');
    });
  });

  describe('normalize (privado)', () => {
    it('deve remover acentos', () => {
      const result = (component as any).normalize('Ação');

      expect(result).toBe('Acao');
    });

    it('deve remover barras, parenteses, espacos e cifrao', () => {
      const result = (component as any).normalize('P/L (12m) $');

      expect(result).toBe('PL12m');
    });

    it('deve remover hifen, porcento, virgula e dois pontos', () => {
      const result = (component as any).normalize('VAR-1% ,:');

      expect(result).toBe('VAR1');
    });
  });
});
