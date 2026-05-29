import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioProfitLossChartComponent } from './PortfolioProfitLossChartComponent';
import { PortfolioService } from '../../services/PortfolioService';
import { FundamentusService } from '../../services/FundamentusService';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { PortfolioItem, FundamentusAcaoDetails } from '../../models';

describe('PortfolioProfitLossChartComponent', () => {
  let component: PortfolioProfitLossChartComponent;
  let fixture: ComponentFixture<PortfolioProfitLossChartComponent>;
  let mockPortfolioService: any;
  let mockFundamentusService: any;

  const mockPortfolioItems: PortfolioItem[] = [
    { id: '1', codigo: 'PETR4', precoMedio: 30, quantidade: 100 },
    { id: '2', codigo: 'VALE5', precoMedio: 70, quantidade: 50 },
  ];

  const mockFundamentusDetails: FundamentusAcaoDetails = {
    codigo: 'PETR4',
    empresa: 'Petrobras',
    setor: 'Petroleo',
    subsetor: 'Refino',
    updatedAt: '2025-01-01',
    indicadores: [
      { label: 'Cotação', value: '35,00' },
    ],
  };

  beforeEach(async () => {
    mockPortfolioService = {
      getPortfolios: vi.fn().mockReturnValue(of(mockPortfolioItems)),
    };

    mockFundamentusService = {
      getAcaoDetails: vi.fn().mockImplementation((codigo: string) => {
        if (codigo === 'PETR4') {
          return of(mockFundamentusDetails);
        }
        return of({
          codigo,
          empresa: 'Test',
          setor: 'Test',
          subsetor: 'Test',
          updatedAt: '2025-01-01',
          indicadores: [{ label: 'Cotação', value: '100,00' }],
        } as FundamentusAcaoDetails);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [PortfolioProfitLossChartComponent],
      providers: [
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: FundamentusService, useValue: mockFundamentusService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioProfitLossChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Criação', () => {
    it('deve criar componente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Valores Padrão', () => {
    it('deve usar chartWidth = 600 como padrão', () => {
      expect(component.chartWidth).toBe(600);
    });

    it('deve usar isMobileLayout = false como padrão', () => {
      expect(component.isMobileLayout).toBe(false);
    });

    it('deve usar barHeight = 25 como padrão', () => {
      expect(component.barHeight).toBe(25);
    });

    it('deve usar barLabelWidth = 80 como padrão', () => {
      expect(component.barLabelWidth).toBe(80);
    });

    it('deve usar valueLabelWidth = 80 como padrão', () => {
      expect(component.valueLabelWidth).toBe(80);
    });

    it('deve inicializar chartHeight', () => {
      expect(component.chartHeight).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('deve configurar layout no ngOnInit', () => {
      component.ngOnInit();
      expect(component.chartWidth).toBeDefined();
    });

    it('deve inicializar chartItems$', () => {
      component.ngOnInit();
      expect(component.chartItems$).toBeDefined();
    });
  });

  describe('getProfitLossChartData', () => {
    it('deve chamar getPortfolios no ngOnInit', () => {
      component.ngOnInit();
      expect(mockPortfolioService.getPortfolios).toHaveBeenCalled();
    });

    it('deve buscar detalhes de cada ação via FundamentusService', () => {
      component.ngOnInit();
      expect(mockFundamentusService.getAcaoDetails).toHaveBeenCalled();
    });
  });

  describe('valueFormatting', () => {
    it('deve formatar valor corretamente', () => {
      const formatted = component.valueFormatting(16.67);
      expect(formatted).toBe('16.67%');
    });

    it('deve formatar valor negativo corretamente', () => {
      const formatted = component.valueFormatting(-10.5);
      expect(formatted).toBe('-10.50%');
    });

    it('deve formatar zero corretamente', () => {
      const formatted = component.valueFormatting(0);
      expect(formatted).toBe('0.00%');
    });
  });

  describe('extractCotacao', () => {
    it('deve extrair cotação corretamente', () => {
      const cotacao = (component as any).extractCotacao(mockFundamentusDetails);
      expect(cotacao).toBe(35);
    });

    it('deve retornar 0 quando details null', () => {
      const cotacao = (component as any).extractCotacao(null);
      expect(cotacao).toBe(0);
    });

    it('deve retornar 0 quando indicadores vazios', () => {
      const details: FundamentusAcaoDetails = {
        codigo: 'TEST',
        empresa: 'Test',
        setor: 'Test',
        subsetor: 'Test',
        updatedAt: '2025-01-01',
        indicadores: [],
      };
      const cotacao = (component as any).extractCotacao(details);
      expect(cotacao).toBe(0);
    });

    it('deve retornar 0 quando indicador não encontrado', () => {
      const details: FundamentusAcaoDetails = {
        codigo: 'TEST',
        empresa: 'Test',
        setor: 'Test',
        subsetor: 'Test',
        updatedAt: '2025-01-01',
        indicadores: [{ label: 'Outro', value: '100' }],
      };
      const cotacao = (component as any).extractCotacao(details);
      expect(cotacao).toBe(0);
    });
  });

  describe('normalizeLabel', () => {
    it('deve normalizar labels', () => {
      const normalized = (component as any).normalizeLabel('Cotação');
      expect(normalized).toBe('cotacao');
    });

    it('deve remover acentos', () => {
      const normalized = (component as any).normalizeLabel('ação');
      expect(normalized).toBe('acao');
    });

    it('deve remover caracteres especiais', () => {
      const normalized = (component as any).normalizeLabel('Test@123!');
      expect(normalized).toBe('test123');
    });
  });

  describe('parseBrazilianNumber', () => {
    it('deve parsear números brasileiros com vírgula', () => {
      const parsed = (component as any).parseBrazilianNumber('35,50');
      expect(parsed).toBe(35.5);
    });

    it('deve parsear números com ponto como separador de milhar', () => {
      const parsed = (component as any).parseBrazilianNumber('1.234,56');
      expect(parsed).toBe(1234.56);
    });

    it('deve remover símbolo de porcentagem', () => {
      const parsed = (component as any).parseBrazilianNumber('50%');
      expect(parsed).toBe(50);
    });

    it('deve retornar 0 para string vazia', () => {
      const parsed = (component as any).parseBrazilianNumber('');
      expect(parsed).toBe(0);
    });

    it('deve retornar 0 para null', () => {
      const parsed = (component as any).parseBrazilianNumber(null);
      expect(parsed).toBe(0);
    });

    it('deve retornar 0 para valor não numérico', () => {
      const parsed = (component as any).parseBrazilianNumber('abc');
      expect(parsed).toBe(0);
    });
  });

  describe('updateLayout', () => {
    it('deve configurar layout corretamente', () => {
      component.ngOnInit();
      expect(component.isMobileLayout).toBeDefined();
      expect(component.chartWidth).toBeDefined();
    });
  });

  describe('onWindowResize', () => {
    it('deve atualizar layout no resize', () => {
      component.ngOnInit();
      component.onWindowResize();
      expect(component.isMobileLayout).toBeDefined();
    });
  });

  describe('buildBarChartItems', () => {
    it('deve retornar array vazio para dados vazios', () => {
      const items = (component as any).buildBarChartItems([]);
      expect(items).toEqual([]);
      expect(component.chartHeight).toBe(0);
    });

    it('deve usar cores corretas para positivo e negativo', () => {
      const testData = [
        { name: 'PETR4', value: 10 },
        { name: 'VALE5', value: -5 },
        { name: 'BBDC4', value: 0 },
      ];
      const items = (component as any).buildBarChartItems(testData);

      expect(items[0].color).toBe('#5AA454');
      expect(items[1].color).toBe('#A10A28');
      expect(items[2].color).toBe('#5AA454');
    });

    it('deve calcular largura da barra corretamente', () => {
      const testData = [
        { name: 'PETR4', value: 50 },
        { name: 'VALE5', value: 100 },
      ];
      const items = (component as any).buildBarChartItems(testData);

      expect(items[0].width).toBeLessThan(items[1].width);
    });
  });

  describe('Cálculos de Lucro/Prejuízo', () => {
    it('deve usar cor verde para valor positivo', () => {
      const item = { name: 'TEST', value: 10 };
      const result = (component as any).buildBarChartItems([item]);
      expect(result[0].color).toBe('#5AA454');
    });

    it('deve usar cor vermelha para valor negativo', () => {
      const item = { name: 'TEST', value: -10 };
      const result = (component as any).buildBarChartItems([item]);
      expect(result[0].color).toBe('#A10A28');
    });

    it('deve usar cor verde para valor zero', () => {
      const item = { name: 'TEST', value: 0 };
      const result = (component as any).buildBarChartItems([item]);
      expect(result[0].color).toBe('#5AA454');
    });
  });
});