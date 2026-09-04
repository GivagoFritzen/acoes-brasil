import { Injectable, signal } from '@angular/core';
import { AlertItem } from '../models/alert/AlertItemModel';
import { filterAlert } from '../utils/AlertUtils';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly alerts = signal<AlertItem[]>([]);

  success(message: string, title = 'Sucesso'): void {
    this.addAlert({
      variant: 'info',
      title,
      message,
      icon: '✓',
    });
  }

  error(message: string, title = 'Erro'): void {
    this.addAlert({
      variant: 'error',
      title,
      message,
      icon: '✕',
    });
  }

  warning(message: string, title = 'Atenção'): void {
    this.addAlert({
      variant: 'warning',
      title,
      message,
      icon: '⚠',
    });
  }

  addAlert(alert: AlertItem): void {
    this.alerts.set([alert]);
  }

  dismiss(alert: AlertItem): void {
    this.alerts.update((items) => items.filter(filterAlert(alert)));
  }

  clear(): void {
    this.alerts.set([]);
  }
}
