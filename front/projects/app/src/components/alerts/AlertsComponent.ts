import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { AlertViewItem } from '../../models/alert/AlertViewItemModel';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './AlertsComponent.html',
  styleUrls: ['./AlertsComponent.scss'],
})
export class AlertsComponent implements OnChanges, OnDestroy {
  private static nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  @Input() alerts: AlertItem[] = [];
  @Input() autoDismissMs = 5000;
  @Output() dismissed = new EventEmitter<AlertItem>();

  alertItems = signal<AlertViewItem[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alerts']) {
      this.resetAlerts();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  closeAlert(id: number): void {
    const removed = this.alertItems().find((item) => item.id === id);
    this.alertItems.update((items) => items.filter((item) => item.id !== id));
    this.clearTimer(id);
    if (removed) {
      this.dismissed.emit(removed);
    }
  }

  private resetAlerts(): void {
    this.clearTimers();
    this.alertItems.set(
      (this.alerts ?? []).map((alert) => ({
        ...alert,
        id: AlertsComponent.nextId++,
      }))
    );

    if (this.autoDismissMs > 0) {
      this.alertItems().forEach((alert) => this.startTimer(alert.id));
    }
  }

  private startTimer(id: number): void {
    const timer = setTimeout(() => this.closeAlert(id), this.autoDismissMs);
    this.timers.set(id, timer);
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private clearTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}