import { Injectable, signal } from '@angular/core';
import { AlertItem } from '../models/alert/AlertItemModel';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  readonly alerts = signal<AlertItem[]>([]);

  addSuccessAlert(title: string, message: string, icon: string = ''): void {
    this.addAlert('info', title, message, icon || 'Check');
  }

  addErrorAlert(title: string, message: string, icon: string = ''): void {
    this.addAlert('error', title, message, icon || 'Close');
  }

  addWarningAlert(title: string, message: string, icon: string = ''): void {
    this.addAlert('warning', title, message, icon || 'Warning');
  }

  dismissAlert(alert: AlertItem): void {
    this.alerts.update((items: AlertItem[]) =>
      items.filter(
        (item: AlertItem) =>
          item.variant !== alert.variant ||
          item.title !== alert.title ||
          item.message !== alert.message ||
          item.icon !== alert.icon,
      ),
    );
  }

  clearAlerts(): void {
    this.alerts.set([]);
  }

  private addAlert(variant: 'info' | 'error' | 'warning', title: string, message: string, icon: string): void {
    const newAlert: AlertItem = {
      variant,
      title,
      message,
      icon,
    };

    this.alerts.update((currentAlerts) => [...currentAlerts, newAlert]);
  }
}
