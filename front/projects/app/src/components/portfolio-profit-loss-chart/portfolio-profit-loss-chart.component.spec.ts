import { TestBed } from '@angular/core/testing';
import { PortfolioProfitLossChartComponent } from './portfolio-profit-loss-chart.component';

describe('PortfolioProfitLossChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PortfolioProfitLossChartComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(PortfolioProfitLossChartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
