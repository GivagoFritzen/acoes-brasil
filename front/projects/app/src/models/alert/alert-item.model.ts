import type { AlertVariant } from './alert-variant.model';

export interface AlertItem {
    variant: AlertVariant;
    title: string;
    message: string;
    icon: string;
}