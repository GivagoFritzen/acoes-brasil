import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Info } from '../../enums/info.enum';
import { FundamentusAcaoDetails, PortfolioItem } from '../../models';
import type { BarChartItem } from '../../models/graphics/bar-chart-item.model';
import type { PositionedDataItem } from '../../models/graphics/positioned-data-item.model';
import type { ProfitLossDataItem } from '../../models/graphics/profit-loss-data-item.model';
import { FundamentusService } from '../../services/fundamentus.service';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-portfolio-profit-loss-chart',
  templateUrl: './portfolio-profit-loss-chart.component.html',
  styleUrls: ['./portfolio-profit-loss-chart.component.scss'],
  standalone: true,
  imports: [CommonModule,],
})
export class PortfolioProfitLossChartComponent implements OnInit {
  chartItems$!: Observable<BarChartItem[]>;
  private readonly isMobileLayout$ = new BehaviorSubject<boolean>(false);
  isMobileLayout = false;

  chartWidth = 600;
  chartHeight = 0;

  // Desktop (horizontal bars)
  barHeight = 25;
  barLabelWidth = 80;
  valueLabelWidth = 80;
  verticalMargin = 15;
  yAxisX = 0;

  // Mobile (vertical bars)
  mobileChartHeight = 320;
  mobileXAxisY = 150;
  mobileLeftPadding = 30;
  mobileRightPadding = 30;
  mobileBarWidth = 26;
  mobileGap = 18;
  mobileLabelOffset = 18;
  mobileValueOffset = 8;

  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly fundamentusService: FundamentusService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) { }

  ngOnInit(): void {
    this.updateLayout();

    this.chartItems$ = combineLatest([
      this.getProfitLossChartData(),
      this.isMobileLayout$,
    ]).pipe(
      map(([data, isMobileLayout]) => {
        this.isMobileLayout = isMobileLayout;
        return this.buildBarChartItems(data);
      })
    );
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateLayout();
  }

  valueFormatting = (value: number) => `${value.toFixed(2)}%`;

  private getProfitLossChartData(): Observable<ProfitLossDataItem[]> {
    return this.portfolioService.getPortfolios().pipe(
      switchMap((portfolioItems: PortfolioItem[]) => {
        if (!portfolioItems || portfolioItems.length === 0) {
          return of([]);
        }

        const itemObservables = portfolioItems.map((item) =>
          this.fundamentusService.getAcaoDetails(item.codigo).pipe(
            map((details) => ({
              portfolioItem: item,
              fundamentusDetails: details,
            })),
            catchError(() =>
              of({
                portfolioItem: item,
                fundamentusDetails: null,
              })
            )
          )
        );

        return forkJoin(itemObservables);
      }),
      map((combinedData) =>
        combinedData.map(({ portfolioItem, fundamentusDetails }) => {
          const cotacao = this.extractCotacao(fundamentusDetails);
          const precoMedio = portfolioItem.precoMedio;

          const profitLossPercentage = precoMedio > 0 && cotacao > 0
            ? ((cotacao - precoMedio) / precoMedio) * 100
            : 0;

          return {
            name: portfolioItem.codigo,
            value: profitLossPercentage,
          };
        })
      )
    );
  }

  private buildBarChartItems(data: ProfitLossDataItem[]): BarChartItem[] {
    if (!data || data.length === 0) {
      this.chartHeight = 0;
      return [];
    }

    const maxAbsValue = data.reduce((max, item) => Math.max(max, Math.abs(item.value)), 0);
    const positionedData = data.map((item, index) => ({ ...item, index }));

    if (this.isMobileLayout) {
      return this.buildVerticalBarChartItems(positionedData, maxAbsValue);
    }

    return this.buildHorizontalBarChartItems(positionedData, maxAbsValue);
  }

  private buildHorizontalBarChartItems(data: PositionedDataItem[], maxAbsValue: number): BarChartItem[] {
    this.chartWidth = 600;
    this.chartHeight = data.length * (this.barHeight + this.verticalMargin);

    const positiveWidth = (this.chartWidth / 2) - this.barLabelWidth;
    const negativeWidth = (this.chartWidth / 2) - this.valueLabelWidth;
    this.yAxisX = negativeWidth + this.barLabelWidth;

    return data.map((item) => {
      const isPositive = item.value >= 0;
      const barWidth = maxAbsValue > 0
        ? (Math.abs(item.value) / maxAbsValue) * (isPositive ? positiveWidth : negativeWidth)
        : 0;
      const y = item.index * (this.barHeight + this.verticalMargin);
      const x = isPositive ? this.yAxisX : this.yAxisX - barWidth;

      return {
        name: item.name,
        value: item.value,
        color: isPositive ? '#5AA454' : '#A10A28',
        width: barWidth,
        height: this.barHeight,
        x,
        y,
        labelX: isPositive ? this.yAxisX - 10 : this.yAxisX + 10,
        labelY: y + this.barHeight / 2,
        labelAnchor: isPositive ? 'end' : 'start',
        valueX: isPositive ? x + barWidth + 5 : x - 5,
        valueY: y + this.barHeight / 2,
        valueAnchor: isPositive ? 'start' : 'end',
      };
    });
  }

  private buildVerticalBarChartItems(data: PositionedDataItem[], maxAbsValue: number): BarChartItem[] {
    const topSpace = 36;
    const bottomSpace = 54;
    const availableHalfHeight = (this.mobileChartHeight - topSpace - bottomSpace) / 2;

    this.mobileXAxisY = topSpace + availableHalfHeight;
    this.chartHeight = this.mobileChartHeight;
    this.chartWidth =
      this.mobileLeftPadding +
      this.mobileRightPadding +
      (data.length * this.mobileBarWidth) +
      ((data.length - 1) * this.mobileGap);

    return data.map((item) => {
      const isPositive = item.value >= 0;
      const barHeight = maxAbsValue > 0
        ? (Math.abs(item.value) / maxAbsValue) * availableHalfHeight
        : 0;
      const x = this.mobileLeftPadding + item.index * (this.mobileBarWidth + this.mobileGap);
      const y = isPositive ? this.mobileXAxisY - barHeight : this.mobileXAxisY;

      return {
        name: item.name,
        value: item.value,
        color: isPositive ? '#5AA454' : '#A10A28',
        width: this.mobileBarWidth,
        height: barHeight,
        x,
        y,
        labelX: x + this.mobileBarWidth / 2,
        labelY: isPositive
          ? this.mobileXAxisY + this.mobileLabelOffset
          : this.mobileXAxisY - this.mobileLabelOffset,
        labelAnchor: 'middle',
        valueX: x + this.mobileBarWidth / 2,
        valueY: isPositive ? y - this.mobileValueOffset : y + barHeight + this.mobileValueOffset,
        valueAnchor: 'middle',
      };
    });
  }

  private extractCotacao(details: FundamentusAcaoDetails | null): number {
    if (!details?.indicadores?.length) {
      return 0;
    }

    const cotacaoIndicator = details.indicadores.find(
      (indicator) => this.normalizeLabel(indicator.label) === this.normalizeLabel(Info.Cotacao)
    );

    return this.parseBrazilianNumber(cotacaoIndicator?.value);
  }

  private normalizeLabel(value: string): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  private parseBrazilianNumber(value?: string | null): number {
    if (!value) {
      return 0;
    }

    const sanitized = value
      .replace(/%/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const parsed = Number.parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private updateLayout(): void {
    let nextIsMobile = false;

    if (!isPlatformBrowser(this.platformId)) {
      nextIsMobile = false;
    } else {
      const isPrintMode = new URLSearchParams(window.location.search).get('print') === '1';
      nextIsMobile = !isPrintMode && window.innerWidth <= 768;
    }

    this.isMobileLayout = nextIsMobile;
    this.isMobileLayout$.next(nextIsMobile);
  }
}