import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { FundamentusAcaoDetails, FundamentusIndicator, Investidor10AcaoDetails, ProventosResponse, YahooFinanceDetails } from '../../../models';
import { FundamentusService } from '../../../services/FundamentusService';
import { Investidor10Service } from '../../../services/Investidor10Service';
import { YahooFinanceService } from '../../../services/YahooFinanceService';
import { GoogleFinanceService } from '../../../services/GoogleFinanceService';
import { ProventosService } from '../../../services/ProventosService';
import { TranslationService } from '../../../services/TranslationService';
import { AcaoDetailsComponent } from './AcaoDetailsComponent';
import type { GoogleFinanceResponse } from '../../../../../../../common/models/google-finance';

describe('AcaoDetailsComponent', () => {
  let component: AcaoDetailsComponent;
  let fundamentusServiceMock: { getAcaoDetails: ReturnType<typeof vi.fn>; getProventos: ReturnType<typeof vi.fn> };
  let investidor10ServiceMock: { getAcaoDetails: ReturnType<typeof vi.fn>; getProventos: ReturnType<typeof vi.fn> };
  let yahooFinanceServiceMock: { getAcaoDetails: ReturnType<typeof vi.fn> };
  let googleFinanceServiceMock: { getData: ReturnType<typeof vi.fn> };
  let proventosServiceMock: { getProventos: ReturnType<typeof vi.fn> };
  let translationServiceMock: {
    get: ReturnType<typeof vi.fn>;
    has: ReturnType<typeof vi.fn>;
  };
  let routeMock: {
    paramMap: {
      subscribe: ReturnType<typeof vi.fn>;
    };
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };

  const baseInvestidor10: Investidor10AcaoDetails = {
    codigo: 'VIVT3',
    empresa: 'VIVO - TELEFÔNICA BRASIL',
    dadosSobreEmpresa: [],
    informacoesSobreEmpresa: [],
    indicadoresFundamentalistas: [],
    historicoIndicadores: [],
    receitas: [],
    updatedAt: '2024-01-01',
  };

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

  const baseYahooFinance: YahooFinanceDetails = {
    codigo: 'VALE3',
    empresa: null,
    keyStatistics: {
      enterpriseValue: '404.72B',
      forwardPE: '46.57',
      profitMargins: '7.26%',
      floatShares: null,
      sharesOutstanding: null,
      heldPercentInsiders: '6.45%',
      heldPercentInstitutions: '54.47%',
      beta: '0.73',
      bookValue: '44.84',
      priceToBook: '1.66',
      earningsQuarterlyGrowth: null,
      netIncomeToCommon: null,
      trailingEps: '3.42',
      forwardEps: '8.18',
      pegRatio: '0.30',
      enterpriseToRevenue: null,
      enterpriseToEbitda: null,
      lastDividendValue: null,
      lastDividendDate: null,
      lastSplitFactor: null,
      marketCap: null,
    },
    financialData: {
      currentPrice: '74.51',
      targetHighPrice: null,
      targetLowPrice: null,
      targetMeanPrice: '87.27',
      targetMedianPrice: null,
      recommendationMean: null,
      recommendationKey: 'buy',
      numberOfAnalystOpinions: null,
      totalCash: '27.55B',
      totalCashPerShare: null,
      ebitda: null,
      totalDebt: '111.96B',
      quickRatio: null,
      currentRatio: null,
      totalRevenue: null,
      debtToEquity: '57.15%',
      revenuePerShare: null,
      returnOnAssets: null,
      returnOnEquity: '6.84%',
      grossProfits: null,
      freeCashflow: '10.6B',
      operatingCashflow: '48.82B',
      earningsGrowth: null,
      revenueGrowth: '2.70%',
      grossMargins: '35.08%',
      ebitdaMargins: '36.25%',
      operatingMargins: null,
      profitMargins: '7.26%',
    },
    incomeStatements: [],
    balanceSheets: [],
    cashflowStatements: [],
    earningsHistory: [],
    calendarEvents: null,
    updatedAt: '2024-01-01',
  };

  const baseProventos: ProventosResponse = {
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const baseFundamentusProventos = {
    codigo: 'PETR4',
    proventos: [],
    updatedAt: '2024-01-01',
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
    localStorage.clear();
    fundamentusServiceMock = {
      getAcaoDetails: vi.fn(),
      getProventos: vi.fn(),
    };
    investidor10ServiceMock = {
      getAcaoDetails: vi.fn(),
      getProventos: vi.fn(),
    };
    yahooFinanceServiceMock = {
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
    fundamentusServiceMock.getProventos.mockReturnValue(of({ codigo: 'PETR4', proventos: [], updatedAt: '2024-01-01' }));
    investidor10ServiceMock.getAcaoDetails.mockReturnValue(of(baseInvestidor10));
    investidor10ServiceMock.getProventos.mockReturnValue(of({ codigo: 'VIVT3', proventos: [], updatedAt: '2024-01-01' }));
    yahooFinanceServiceMock.getAcaoDetails.mockReturnValue(of(baseYahooFinance));
    proventosServiceMock.getProventos.mockReturnValue(of(baseProventos));
    googleFinanceServiceMock.getData.mockReturnValue(of(baseGoogleFinance));

    await TestBed.configureTestingModule({
      imports: [AcaoDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: FundamentusService, useValue: fundamentusServiceMock },
        { provide: Investidor10Service, useValue: investidor10ServiceMock },
        { provide: YahooFinanceService, useValue: yahooFinanceServiceMock },
        { provide: GoogleFinanceService, useValue: googleFinanceServiceMock },
        { provide: ProventosService, useValue: proventosServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    const fixture = TestBed.createComponent(AcaoDetailsComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter yahooFinance signal inicializado como null', () => {
    expect(component.yahooFinance()).toBeNull();
  });

  it('deve ter detailOptions com yahoo', () => {
    expect(component.detailOptions).toContain('yahoo');
  });

  describe('ngOnInit', () => {
    it('deve carregar detalhes com codigo valido', () => {
      component.ngOnInit();

      expect(fundamentusServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(fundamentusServiceMock.getProventos).toHaveBeenCalledWith('PETR4');
      expect(googleFinanceServiceMock.getData).toHaveBeenCalledWith('PETR4');
      expect(component.fundamentus()).toEqual(baseFundamentus);
      expect(component.fundamentusProventos()).toEqual(baseFundamentusProventos);
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
      component.fundamentusProventos.set(null);
      fundamentusServiceMock.getProventos.mockReturnValue(of(baseFundamentusProventos));

      component['loadAcaoDetails']('PETR4');

      expect(component.fundamentusProventos()).toEqual(baseFundamentusProventos);
    });

    it('deve tratar erro ao carregar proventos', () => {
      fundamentusServiceMock.getProventos.mockReturnValue(throwError(() => new Error('erro')));

      component['loadAcaoDetails']('PETR4');

      expect(component.fundamentusProventos()).toBeNull();
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
      expect(component.fundamentusProventos()).toEqual(baseFundamentusProventos);
    });

    it('deve normalizar codigo para maiusculas e trim', () => {
      component['loadAcaoDetails']('  petr4  ');

      expect(fundamentusServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(fundamentusServiceMock.getProventos).toHaveBeenCalledWith('PETR4');
      expect(googleFinanceServiceMock.getData).toHaveBeenCalledWith('PETR4');
    });

    it('deve setar warning quando fundamentus e null', () => {
      fundamentusServiceMock.getAcaoDetails.mockReturnValue(of(null));

      component['loadAcaoDetails']('PETR4');

      expect(component.alerts().length).toBe(1);
      expect(component.alerts()[0].variant).toBe('warning');
    });

    it('deve setar warning quando proventos e null', () => {
      fundamentusServiceMock.getProventos.mockReturnValue(of(null));

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
      fundamentusServiceMock.getProventos.mockReturnValue(of(null));
      googleFinanceServiceMock.getData.mockReturnValue(of(null));

      component['loadAcaoDetails']('PETR4');

      expect(component.alerts().length).toBe(2);
    });

    it('deve carregar fundamentus e proventos mesmo quando googleFinance falha', () => {
      googleFinanceServiceMock.getData.mockReturnValue(throwError(() => new Error('erro')));

      component['loadAcaoDetails']('PETR4');

      expect(component.fundamentus()).toEqual(baseFundamentus);
      expect(component.fundamentusProventos()).toEqual(baseFundamentusProventos);
      expect(component.googleFinance()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('loadAcaoDetails com yahoo source', () => {
    beforeEach(() => {
      component.selectDetailSource('yahoo');
      fundamentusServiceMock.getAcaoDetails.mockClear();
      yahooFinanceServiceMock.getAcaoDetails.mockClear();
    });

    it('deve carregar yahooFinance quando source for yahoo', () => {
      yahooFinanceServiceMock.getAcaoDetails.mockReturnValue(of(baseYahooFinance));

      component['loadAcaoDetails']('VALE3');

      expect(yahooFinanceServiceMock.getAcaoDetails).toHaveBeenCalledWith('VALE3');
      expect(component.yahooFinance()).toEqual(baseYahooFinance);
      expect(component.fundamentus()).toBeNull();
      expect(component.investidor10()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });

    it('deve setar warning quando yahooFinance retorna null', () => {
      yahooFinanceServiceMock.getAcaoDetails.mockReturnValue(of(null));

      component['loadAcaoDetails']('VALE3');

      expect(component.yahooFinance()).toBeNull();
      expect(component.alerts().length).toBe(1);
      expect(component.alerts()[0].variant).toBe('warning');
    });

    it('deve tratar erro ao carregar yahooFinance', () => {
      yahooFinanceServiceMock.getAcaoDetails.mockReturnValue(throwError(() => new Error('erro')));

      component['loadAcaoDetails']('VALE3');

      expect(component.yahooFinance()).toBeNull();
      expect(component.alerts().length).toBe(1);
      expect(component.alerts()[0].variant).toBe('warning');
    });

    it('deve continuar carregando googleFinance mesmo com source yahoo', () => {
      yahooFinanceServiceMock.getAcaoDetails.mockReturnValue(of(baseYahooFinance));

      component['loadAcaoDetails']('VALE3');

      expect(googleFinanceServiceMock.getData).toHaveBeenCalled();
    });
  });

  describe('selectedSourceProventos', () => {
    it('deve retornar null quando source for yahoo', () => {
      component.selectDetailSource('yahoo');

      expect(component.selectedSourceProventos()).toBeNull();
    });

    it('deve retornar fundamentusProventos quando source for fundamentus', () => {
      component.fundamentusProventos.set(baseFundamentusProventos);

      expect(component.selectedSourceProventos()).toEqual(baseFundamentusProventos);
    });

    it('deve retornar investidor10Proventos quando source for investidor10', () => {
      component.selectDetailSource('investidor10');

      expect(component.selectedSourceProventos()).toEqual({ codigo: 'VIVT3', proventos: [], updatedAt: '2024-01-01' });
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

  describe('loadSavedSource (privado)', () => {
    it('deve retornar fundamentus quando nada salvo no localStorage', () => {
      localStorage.removeItem('app_acao_details_source');

      const result = component['loadSavedSource']();

      expect(result).toBe('fundamentus');
    });

    it('deve retornar valor salvo quando for investidor10', () => {
      localStorage.setItem('app_acao_details_source', 'investidor10');

      const result = component['loadSavedSource']();

      expect(result).toBe('investidor10');
    });

    it('deve retornar valor salvo quando for fundamentus', () => {
      localStorage.setItem('app_acao_details_source', 'fundamentus');

      const result = component['loadSavedSource']();

      expect(result).toBe('fundamentus');
    });

    it('deve retornar valor salvo quando for yahoo', () => {
      localStorage.setItem('app_acao_details_source', 'yahoo');

      const result = component['loadSavedSource']();

      expect(result).toBe('yahoo');
    });

    it('deve retornar fundamentus quando localStorage tiver valor invalido', () => {
      localStorage.setItem('app_acao_details_source', 'invalido');

      const result = component['loadSavedSource']();

      expect(result).toBe('fundamentus');
    });
  });

  describe('selectDetailSource', () => {
    it('deve alternar para investidor10, persistir e recarregar detalhes', () => {
      component.selectDetailSource('investidor10');

      expect(component.detailSource()).toBe('investidor10');
      expect(localStorage.getItem('app_acao_details_source')).toBe('investidor10');
      expect(component.isPersonalizarOpen()).toBe(false);
      expect(investidor10ServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(component.investidor10()).toEqual(baseInvestidor10);
    });

    it('deve apenas fechar modal ao clicar no mesmo source, sem recarregar', () => {
      component.selectDetailSource('investidor10');
      investidor10ServiceMock.getAcaoDetails.mockClear();
      fundamentusServiceMock.getAcaoDetails.mockClear();

      component.selectDetailSource('investidor10');

      expect(component.detailSource()).toBe('investidor10');
      expect(component.isPersonalizarOpen()).toBe(false);
      expect(investidor10ServiceMock.getAcaoDetails).not.toHaveBeenCalled();
      expect(fundamentusServiceMock.getAcaoDetails).not.toHaveBeenCalled();
    });

    it('deve alternar de investidor10 para fundamentus e recarregar', () => {
      component.selectDetailSource('investidor10');
      component.selectDetailSource('fundamentus');

      expect(component.detailSource()).toBe('fundamentus');
      expect(localStorage.getItem('app_acao_details_source')).toBe('fundamentus');
      expect(component.isPersonalizarOpen()).toBe(false);
      expect(fundamentusServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(component.fundamentus()).toEqual(baseFundamentus);
    });

    it('deve alternar para yahoo, persistir e recarregar', () => {
      yahooFinanceServiceMock.getAcaoDetails.mockReturnValue(of(baseYahooFinance));
      component.selectDetailSource('yahoo');

      expect(component.detailSource()).toBe('yahoo');
      expect(localStorage.getItem('app_acao_details_source')).toBe('yahoo');
      expect(component.isPersonalizarOpen()).toBe(false);
      expect(yahooFinanceServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(component.yahooFinance()).toEqual(baseYahooFinance);
    });

    it('deve alternar de yahoo para fundamentus e recarregar', () => {
      yahooFinanceServiceMock.getAcaoDetails.mockReturnValue(of(baseYahooFinance));
      component.selectDetailSource('yahoo');
      fundamentusServiceMock.getAcaoDetails.mockClear();
      yahooFinanceServiceMock.getAcaoDetails.mockClear();

      component.selectDetailSource('fundamentus');

      expect(component.detailSource()).toBe('fundamentus');
      expect(localStorage.getItem('app_acao_details_source')).toBe('fundamentus');
      expect(fundamentusServiceMock.getAcaoDetails).toHaveBeenCalledWith('PETR4');
      expect(component.fundamentus()).toEqual(baseFundamentus);
      expect(component.yahooFinance()).toBeNull();
    });
  });
});
