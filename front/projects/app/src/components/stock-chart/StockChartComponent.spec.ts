import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChanges } from '@angular/core';
import { StockChartComponent } from './StockChartComponent';
import type { GoogleFinanceChartPoint } from '../../../../../../common/models/google-finance';

function makePoints(...prices: number[]): GoogleFinanceChartPoint[] {
  return prices.map((price, indice) => {
    const date = new Date(2024, 0, 1 + indice);
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return {
      timestamp: date.getTime(),
      date: `${date.getFullYear()}-${mes}-${dia}`,
      price,
      volume: 1000,
    };
  });
}

function svgClickEvent(clientX: number): MouseEvent {
  return {
    currentTarget: {
      getBoundingClientRect: () => ({ width: 700, left: 0 }) as DOMRect,
    },
    clientX,
  } as unknown as MouseEvent;
}

describe('StockChartComponent', () => {
  let component: StockChartComponent;
  let fixture: ComponentFixture<StockChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockChartComponent);
    component = fixture.componentInstance;
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  describe('hasData / buildChart', () => {
    it('deve setar hasData false quando points vazio', () => {
      component.points = [];
      component.ngOnChanges({} as SimpleChanges);

      expect(component.hasData).toBe(false);
      expect(component.linePoints).toEqual([]);
    });

    it('deve setar hasData false quando points com 1 elemento', () => {
      component.points = makePoints(100);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.hasData).toBe(false);
      expect(component.linePoints).toEqual([]);
    });

    it('deve setar hasData true quando points tem 2+ elementos', () => {
      component.points = makePoints(100, 200);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.hasData).toBe(true);
      expect(component.linePoints.length).toBe(2);
    });
  });

  describe('chartColor / isPositive', () => {
    it('deve ser verde quando ultimo preco >= primeiro', () => {
      component.points = makePoints(100, 150, 200);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.isPositive).toBe(true);
      expect(component.chartColor).toBe('#16d19a');
    });

    it('deve ser vermelho quando ultimo preco < primeiro', () => {
      component.points = makePoints(200, 150, 100);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.isPositive).toBe(false);
      expect(component.chartColor).toBe('#ff4568');
    });
  });

  describe('endPoint', () => {
    it('deve retornar ultimo ponto quando existem pontos', () => {
      component.points = makePoints(100, 200);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.endPoint).toEqual(component.linePoints[1]);
    });

    it('deve retornar null quando nao ha pontos', () => {
      component.points = [];
      component.ngOnChanges({} as SimpleChanges);

      expect(component.endPoint).toBeNull();
    });
  });

  describe('gridLines', () => {
    it('deve gerar 6 linhas de grade', () => {
      component.points = makePoints(100, 200);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.gridLines.length).toBe(6);
    });

    it('deve rotular precos em formato pt-BR', () => {
      component.points = makePoints(0, 1000);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.gridLines[0].label).toContain('1.000');
      expect(component.gridLines[5].label).toContain('0');
    });
  });

  describe('priceRange', () => {
    it('deve ser 1 quando todos precos iguais', () => {
      component.points = makePoints(50, 50, 50);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.priceRange).toBe(1);
    });
  });

  describe('onSvgClick', () => {
    it('deve selecionar ponto mais proximo quando click no svg', () => {
      component.points = makePoints(50, 100);
      component.ngOnChanges({} as SimpleChanges);

      component.onSvgClick(svgClickEvent(372));

      expect(component.selectedPoint).not.toBeNull();
      expect(component.selectedPoint!.price).toBe(50);
    });

    it('deve desselecionar ao clicar no mesmo ponto', () => {
      component.points = makePoints(50, 100);
      component.ngOnChanges({} as SimpleChanges);

      component.onSvgClick(svgClickEvent(372));
      expect(component.selectedPoint).not.toBeNull();

      component.onSvgClick(svgClickEvent(372));

      expect(component.selectedPoint).toBeNull();
    });

    it('deve limpar selecao quando nao encontra ponto proximo', () => {
      component.points = makePoints(50, 100);
      component.ngOnChanges({} as SimpleChanges);
      component.selectedPoint = {
        date: '',
        price: 0,
        formattedPrice: '',
        formattedDate: '',
        x: 0,
        y: 0,
        tooltipX: 0,
        tooltipY: 0,
      };

      component.onSvgClick(svgClickEvent(-9999));

      expect(component.selectedPoint).toBeNull();
    });

    it('deve manter selectedPoint null quando nao ha pontos', () => {
      component.points = [];
      component.ngOnChanges({} as SimpleChanges);

      component.onSvgClick(svgClickEvent(100));

      expect(component.selectedPoint).toBeNull();
    });
  });

  describe('previousClose input', () => {
    it('deve aceitar previousClose como input', () => {
      component.previousClose = 42.5;
      expect(component.previousClose).toBe(42.5);
    });

    it('deve aceitar previousClose null', () => {
      component.previousClose = null;
      expect(component.previousClose).toBeNull();
    });
  });

  describe('width / height inputs', () => {
    it('deve usar valores padrao quando nao informado', () => {
      expect(component.width).toBe(700);
      expect(component.height).toBe(350);
    });

    it('deve recalcular chartDimensions com width customizado', () => {
      component.width = 500;
      component.height = 300;
      component.points = makePoints(100, 200);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.chartDimensions.width).toBe(500);
      expect(component.chartDimensions.height).toBe(300);
      expect(component.chartDimensions.plotWidth).toBe(424);
      expect(component.chartDimensions.plotHeight).toBe(244);
    });
  });

  describe('formatDateLabel', () => {
    it('deve formatar data para pt-BR', () => {
      const expected = new Date('2024-01-05T12:00:00.000Z').toLocaleDateString('pt-BR');
      const formatted = component['formatDateLabel']('2024-01-05T12:00:00.000Z') as string;

      expect(formatted).toBe(expected);
    });

    it('deve retornar string original quando data invalida', () => {
      const formatted = component['formatDateLabel']('invalido') as string;

      expect(formatted).toBe('invalido');
    });
  });

  describe('linePath / fillPath', () => {
    it('deve gerar linePath e fillPath quando ha dados', () => {
      component.points = makePoints(100, 200);
      component.ngOnChanges({} as SimpleChanges);

      expect(component.linePath).toContain('M');
      expect(component.linePath).toContain('L');
      expect(component.fillPath).toContain('Z');
    });

    it('deve manter paths vazios quando sem dados', () => {
      component.points = [];
      component.ngOnChanges({} as SimpleChanges);

      expect(component.linePath).toBe('');
      expect(component.fillPath).toBe('');
    });
  });
});
