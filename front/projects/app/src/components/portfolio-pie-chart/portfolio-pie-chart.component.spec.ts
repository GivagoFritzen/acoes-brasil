import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioPieChartComponent } from './portfolio-pie-chart.component';
import { PortfolioItem } from '../../models';

describe('PortfolioPieChartComponent', () => {
  let component: PortfolioPieChartComponent;
  let fixture: ComponentFixture<PortfolioPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPieChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioPieChartComponent);
    component = fixture.componentInstance;
  });

  describe('Criação', () => {
    it('deve criar componente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Inputs Padrão', () => {
    it('deve usar portfolios vazio como padrão', () => {
      expect(component.portfolios).toEqual([]);
    });
  });

  describe('Signals Padrão', () => {
    it('deve usar slices vazio como padrão', () => {
      expect(component.slices).toEqual([]);
    });

    it('deve usar highlightedIndex null como padrão', () => {
      expect(component.highlightedIndex).toBeNull();
    });
  });

  describe('ngOnChanges', () => {
    it('deve gerar slices vazias quando portfolios vazio', () => {
      component.portfolios = [];
      component.ngOnChanges();
      expect(component.slices).toEqual([]);
    });

    it('deve gerar slices vazias quando portfolios null', () => {
      component.portfolios = null as any;
      component.ngOnChanges();
      expect(component.slices).toEqual([]);
    });

    it('deve gerar slices corretas com portfolios válidos', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: 100 },
        { codigo: 'VALE5', precoMedio: 70, quantidade: 50 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices.length).toBe(2);
      expect(component.slices[0].label).toBe('PETR4');
      expect(component.slices[1].label).toBe('VALE5');
    });

    it('deve calcular percentagens corretamente', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 50, quantidade: 100 },
        { codigo: 'VALE5', precoMedio: 50, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].percentage).toBe(50);
      expect(component.slices[1].percentage).toBe(50);
    });

    it('deve filtrar valores inválidos (precoMedio <= 0)', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 0, quantidade: 100 },
        { codigo: 'VALE5', precoMedio: 50, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices.length).toBe(1);
      expect(component.slices[0].label).toBe('VALE5');
    });

    it('deve filtrar valores inválidos (quantidade <= 0)', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: 0 },
        { codigo: 'VALE5', precoMedio: 50, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices.length).toBe(1);
      expect(component.slices[0].label).toBe('VALE5');
    });

    it('deve filtrar valores negativos', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: -30, quantidade: 100 },
        { codigo: 'VALE5', precoMedio: 50, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices.length).toBe(1);
      expect(component.slices[0].label).toBe('VALE5');
    });

    it('deve usar cores na ordem correta', () => {
      component.portfolios = [
        { codigo: 'A', precoMedio: 10, quantidade: 100 },
        { codigo: 'B', precoMedio: 10, quantidade: 100 },
        { codigo: 'C', precoMedio: 10, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].color).toBe('#1e88e5');
      expect(component.slices[1].color).toBe('#16d19a');
      expect(component.slices[2].color).toBe('#f8b423');
    });

    it('deve repetir cores após 6 itens', () => {
      component.portfolios = [
        { codigo: 'A', precoMedio: 10, quantidade: 100 },
        { codigo: 'B', precoMedio: 10, quantidade: 100 },
        { codigo: 'C', precoMedio: 10, quantidade: 100 },
        { codigo: 'D', precoMedio: 10, quantidade: 100 },
        { codigo: 'E', precoMedio: 10, quantidade: 100 },
        { codigo: 'F', precoMedio: 10, quantidade: 100 },
        { codigo: 'G', precoMedio: 10, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[6].color).toBe('#1e88e5');
    });
  });

  describe('setHighlightedSlice', () => {
    it('deve definir highlightedIndex ao chamar setHighlightedSlice', () => {
      component.setHighlightedSlice(2);
      expect(component.highlightedIndex).toBe(2);
    });

    it('deve permitir definir highlightedIndex como null', () => {
      component.setHighlightedSlice(2);
      component.setHighlightedSlice(null);
      expect(component.highlightedIndex).toBeNull();
    });
  });

  describe('Cálculos de Porcentagem', () => {
    it('deve calcular 100% para um único item', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].percentage).toBe(100);
    });

    it('deve calcular porcentagens com valores diferentes', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 75, quantidade: 100 },
        { codigo: 'VALE5', precoMedio: 25, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].percentage).toBe(75);
      expect(component.slices[1].percentage).toBe(25);
    });
  });

  describe('Valores Calculados', () => {
    it('deve calcular value como precoMedio * quantidade', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].value).toBe(3000);
    });

    it('deve gerar path SVG válido', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].path).toContain('M');
      expect(component.slices[0].path).toContain('A');
      expect(component.slices[0].path).toContain('Z');
    });

    it('deve calcular labelX e labelY para posição do label', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].labelX).toBeDefined();
      expect(component.slices[0].labelY).toBeDefined();
      expect(typeof component.slices[0].labelX).toBe('number');
      expect(typeof component.slices[0].labelY).toBe('number');
    });
  });

  describe('Slice de 100%', () => {
    it('deve ajustar endAngle para slice de 100%', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices[0].path).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com portfolios com precoMedio null', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: null as any, quantidade: 100 },
        { codigo: 'VALE5', precoMedio: 50, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices.length).toBe(1);
    });

    it('deve lidar com portfolios com quantidade null', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: 30, quantidade: null as any },
        { codigo: 'VALE5', precoMedio: 50, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices.length).toBe(1);
    });

    it('deve lidar com valor Infinity', () => {
      component.portfolios = [
        { codigo: 'PETR4', precoMedio: Infinity, quantidade: 100 },
        { codigo: 'VALE5', precoMedio: 50, quantidade: 100 },
      ] as PortfolioItem[];
      component.ngOnChanges();

      expect(component.slices.length).toBe(1);
    });
  });
});