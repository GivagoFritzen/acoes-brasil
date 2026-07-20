import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleFinanceChartPoint } from '../../../../../../common/models/google-finance';
import { ChartDimensions, GridLine, LinePoint, SelectedPointInfo } from '../../models';

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './StockChartComponent.html',
  styleUrls: ['./StockChartComponent.scss'],
})
export class StockChartComponent implements OnChanges {
  @Input() points: GoogleFinanceChartPoint[] = [];
  @Input() previousClose: number | null = null;
  @Input() width = 700;
  @Input() height = 350;

  linePath = '';
  fillPath = '';
  gridLines: GridLine[] = [];
  chartDimensions: ChartDimensions = this.calcDimensions();
  minPrice = 0;
  maxPrice = 0;
  priceRange = 0;
  isPositive = true;
  hasData = false;

  linePoints: LinePoint[] = [];
  selectedPoint: SelectedPointInfo | null = null;
  tooltipW = 130;
  tooltipH = 44;

  get chartColor(): string {
    return this.isPositive ? '#16d19a' : '#ff4568';
  }

  get endPoint(): LinePoint | null {
    if (!this.linePoints.length) return null;
    return this.linePoints[this.linePoints.length - 1];
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.buildChart();
    this.updateTooltipSize();
  }

  onSvgClick(event: MouseEvent): void {
    this.updateTooltipSize();

    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const scaleX = this.chartDimensions.width / rect.width;
    const svgX = (event.clientX - rect.left) * scaleX;

    const nearest = this.findNearestPoint(svgX);
    if (nearest === null) {
      this.selectedPoint = null;
      return;
    }

    if (this.selectedPoint && this.selectedPoint.x === this.linePoints[nearest].x) {
      this.selectedPoint = null;
      return;
    }

    this.selectPoint(nearest);
  }

  private updateTooltipSize(): void {
    const BREAKPOINT_MOBILE = 425;
    const TOOLTIP_LARGURA_MOBILE = 170;
    const TOOLTIP_LARGURA_DESKTOP = 130;
    const TOOLTIP_ALTURA_MOBILE = 64;
    const TOOLTIP_ALTURA_DESKTOP = 44;
    const isMobile = window.innerWidth <= BREAKPOINT_MOBILE;
    this.tooltipW = isMobile ? TOOLTIP_LARGURA_MOBILE : TOOLTIP_LARGURA_DESKTOP;
    this.tooltipH = isMobile ? TOOLTIP_ALTURA_MOBILE : TOOLTIP_ALTURA_DESKTOP;
  }

  private calcDimensions(): ChartDimensions {
    const PADDING_TOP = 16;
    const PADDING_RIGHT = 16;
    const PADDING_BOTTOM = 40;
    const PADDING_LEFT = 60;
    return {
      width: this.width,
      height: this.height,
      paddingTop: PADDING_TOP,
      paddingRight: PADDING_RIGHT,
      paddingLeft: PADDING_LEFT,
      paddingBottom: PADDING_BOTTOM,
      plotWidth: this.width - PADDING_LEFT - PADDING_RIGHT,
      plotHeight: this.height - PADDING_TOP - PADDING_BOTTOM,
    };
  }

  private buildChart(): void {
    this.chartDimensions = this.calcDimensions();
    this.selectedPoint = null;

    if (!this.points || this.points.length < 2) {
      this.hasData = false;
      this.linePoints = [];
      return;
    }

    const prices = this.points.map(ponto => ponto.price);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
    this.priceRange = this.maxPrice - this.minPrice || 1;
    this.isPositive = prices[prices.length - 1] >= prices[0];
    this.hasData = true;

    const dims = this.chartDimensions;
    this.linePoints = this.points.map((pt, i) => this.toPixel(pt, i, dims));

    this.linePath = this.buildLinePath(this.linePoints);
    this.fillPath = this.buildFillPath(this.linePoints, dims);
    this.gridLines = this.buildGridLines(dims);
  }

  private toPixel(ponto: GoogleFinanceChartPoint, index: number, dims: ChartDimensions): LinePoint {
    const posicaoX = dims.paddingLeft + (index / (this.points.length - 1)) * dims.plotWidth;
    const posicaoY = dims.paddingTop + ((this.maxPrice - ponto.price) / this.priceRange) * dims.plotHeight;
    return { x: posicaoX, y: posicaoY };
  }

  private buildLinePath(points: LinePoint[]): string {
    return points.map((ponto, indice) =>
      `${indice === 0 ? 'M' : 'L'}${ponto.x.toFixed(1)},${ponto.y.toFixed(1)}`
    ).join(' ');
  }

  private buildFillPath(points: LinePoint[], dims: ChartDimensions): string {
    const bottomY = dims.paddingTop + dims.plotHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${this.linePath} L${last.x.toFixed(1)},${bottomY.toFixed(1)} L${first.x.toFixed(1)},${bottomY.toFixed(1)} Z`;
  }

  private buildGridLines(dims: ChartDimensions): GridLine[] {
    const lines: GridLine[] = [];
    const gridCount = 5;

    for (let indice = 0; indice <= gridCount; indice++) {
      const ratio = indice / gridCount;
      const posicaoY = dims.paddingTop + ratio * dims.plotHeight;
      const price = this.maxPrice - ratio * this.priceRange;
      lines.push({
        x1: dims.paddingLeft,
        y1: posicaoY,
        x2: dims.paddingLeft + dims.plotWidth,
        y2: posicaoY,
        label: price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      });
    }

    return lines;
  }

  private selectPoint(index: number): void {
    const GAP_TOOLTIP = 8;
    const ponto = this.points[index];
    const pixel = this.linePoints[index];
    const dims = this.chartDimensions;

    let tooltipX = pixel.x - this.tooltipW / 2;
    let tooltipY = pixel.y - this.tooltipH - GAP_TOOLTIP;

    const minX = dims.paddingLeft;
    const maxX = dims.paddingLeft + dims.plotWidth - this.tooltipW;
    if (tooltipX < minX) tooltipX = minX;
    if (tooltipX > maxX) tooltipX = maxX;

    if (tooltipY < dims.paddingTop) {
      tooltipY = pixel.y + GAP_TOOLTIP;
    }

    this.selectedPoint = {
      date: ponto.date,
      price: ponto.price,
      formattedPrice: ponto.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      formattedDate: this.formatDateLabel(ponto.date),
      x: pixel.x,
      y: pixel.y,
      tooltipX: tooltipX,
      tooltipY: tooltipY,
    };
  }

  private findNearestPoint(svgX: number): number | null {
    if (this.linePoints.length === 0) return null;

    let minDist = Infinity;
    let nearestIdx = -1;

    for (let indice = 0; indice < this.linePoints.length; indice++) {
      const dist = Math.abs(this.linePoints[indice].x - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = indice;
      }
    }

    const FATOR_DISTANCIA_MAXIMA = 1.5;
    const threshold = (this.chartDimensions.plotWidth / this.points.length) * FATOR_DISTANCIA_MAXIMA;
    if (minDist > threshold) return null;

    return nearestIdx;
  }

  private formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR');
    }
    return dateStr;
  }
}
