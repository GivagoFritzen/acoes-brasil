import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { PortfolioItem, PortfolioPieSlice } from '../../models';

@Component({
    selector: 'app-portfolio-pie-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './PortfolioPieChartComponent.html',
    styleUrls: ['./PortfolioPieChartComponent.scss'],
})
export class PortfolioPieChartComponent implements OnChanges {
    @Input() portfolios: PortfolioItem[] = [];

    slices: PortfolioPieSlice[] = [];
    highlightedIndex: number | null = null;

    private readonly colors = ['#1e88e5', '#16d19a', '#f8b423', '#ff4568', '#7b61d1', '#00b8d9'];
    private readonly radius = 95;
    private readonly labelRadius = 62;

    ngOnChanges(): void {
        this.buildChart();
    }

    setHighlightedSlice(index: number | null): void {
        this.highlightedIndex = index;
    }

    private buildChart(): void {
        const entries = (this.portfolios ?? [])
            .map((item) => ({
                label: item.codigo,
                value: item.precoMedio * item.quantidade,
            }))
            .filter((item) => Number.isFinite(item.value) && item.value > 0);

        const total = entries.reduce((sum, item) => sum + item.value, 0);

        if (total <= 0) {
            this.slices = [];
            return;
        }

        let accumulatedRatio = 0;

        this.slices = entries.map((entry, index) => {
            const ratio = entry.value / total;
            const startAngle = accumulatedRatio * (Math.PI * 2) - Math.PI / 2;
            accumulatedRatio += ratio;
            let endAngle = accumulatedRatio * (Math.PI * 2) - Math.PI / 2;

            // When a slice is 100%, the start and end angles are the same, which results in no arc being drawn.
            // We make the end angle slightly less than a full circle to ensure it renders correctly.
            if (endAngle - startAngle >= Math.PI * 2 - 0.001) {
                endAngle = startAngle + Math.PI * 2 - 0.001;
            }
            const middleAngle = (startAngle + endAngle) / 2;

            return {
                label: entry.label,
                value: entry.value,
                percentage: ratio * 100,
                color: this.colors[index % this.colors.length],
                path: this.createSlicePath(startAngle, endAngle),
                labelX: this.labelRadius * Math.cos(middleAngle),
                labelY: this.labelRadius * Math.sin(middleAngle),
            };
        });
    }

    private createSlicePath(startAngle: number, endAngle: number): string {
        const startX = this.radius * Math.cos(startAngle);
        const startY = this.radius * Math.sin(startAngle);
        const endX = this.radius * Math.cos(endAngle);
        const endY = this.radius * Math.sin(endAngle);
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

        return `M 0 0 L ${startX} ${startY} A ${this.radius} ${this.radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    }
}
