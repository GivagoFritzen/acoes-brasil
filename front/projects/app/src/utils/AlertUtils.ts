import { AlertItem } from '../models/alert/AlertItemModel';

export function filterAlert(alert: AlertItem): (item: AlertItem) => boolean {
  return (item) =>
    item.variant !== alert.variant ||
    item.title !== alert.title ||
    item.message !== alert.message ||
    item.icon !== alert.icon;
}
