import { TestBed } from '@angular/core/testing';
import { PortfolioPieChartComponent } from './portfolio-pie-chart.component';

describe('PortfolioPieChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PortfolioPieChartComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(PortfolioPieChartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
