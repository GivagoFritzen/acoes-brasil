interface BarChartItem {
    name: string;
    value: number;
    color: string;
    width: number;
    height: number;
    x: number;
    y: number;
    labelX: number;
    labelY: number;
    labelAnchor: 'start' | 'middle' | 'end';
    valueX: number;
    valueY: number;
    valueAnchor: 'start' | 'middle' | 'end';
}