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
    const isMobile = window.innerWidth <= 425;
    this.tooltipW = isMobile ? 170 : 130;
    this.tooltipH = isMobile ? 64 : 44;
  }

  private calcDimensions(): ChartDimensions {
    const paddingTop = 16;
    const paddingRight = 16;
    const paddingBottom = 40;
    const paddingLeft = 60;
    return {
      width: this.width,
      height: this.height,
      paddingTop,
      paddingRight,
      paddingLeft,
      paddingBottom,
      plotWidth: this.width - paddingLeft - paddingRight,
      plotHeight: this.height - paddingTop - paddingBottom,
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

    const prices = this.points.map(p => p.price);
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

  private toPixel(pt: GoogleFinanceChartPoint, index: number, dims: ChartDimensions): LinePoint {
    const x = dims.paddingLeft + (index / (this.points.length - 1)) * dims.plotWidth;
    const y = dims.paddingTop + ((this.maxPrice - pt.price) / this.priceRange) * dims.plotHeight;
    return { x, y };
  }

  private buildLinePath(points: LinePoint[]): string {
    return points.map((pt, i) =>
      `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
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

    for (let i = 0; i <= gridCount; i++) {
      const ratio = i / gridCount;
      const y = dims.paddingTop + ratio * dims.plotHeight;
      const price = this.maxPrice - ratio * this.priceRange;
      lines.push({
        x1: dims.paddingLeft,
        y1: y,
        x2: dims.paddingLeft + dims.plotWidth,
        y2: y,
        label: price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      });
    }

    return lines;
  }

  private selectPoint(index: number): void {
    const pt = this.points[index];
    const pixel = this.linePoints[index];
    const dims = this.chartDimensions;

    const gap = 8;

    let tx = pixel.x - this.tooltipW / 2;
    let ty = pixel.y - this.tooltipH - gap;

    const minX = dims.paddingLeft;
    const maxX = dims.paddingLeft + dims.plotWidth - this.tooltipW;
    if (tx < minX) tx = minX;
    if (tx > maxX) tx = maxX;

    if (ty < dims.paddingTop) {
      ty = pixel.y + gap;
    }

    this.selectedPoint = {
      date: pt.date,
      price: pt.price,
      formattedPrice: pt.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      formattedDate: this.formatDateLabel(pt.date),
      x: pixel.x,
      y: pixel.y,
      tooltipX: tx,
      tooltipY: ty,
    };
  }

  private findNearestPoint(svgX: number): number | null {
    if (this.linePoints.length === 0) return null;

    let minDist = Infinity;
    let nearestIdx = -1;

    for (let i = 0; i < this.linePoints.length; i++) {
      const dist = Math.abs(this.linePoints[i].x - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    const threshold = (this.chartDimensions.plotWidth / this.points.length) * 1.5;
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
