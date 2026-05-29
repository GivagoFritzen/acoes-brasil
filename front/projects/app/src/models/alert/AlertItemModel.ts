import type { AlertVariant } from './AlertVariantModel';

export interface AlertItem {
    variant: AlertVariant;
    title: string;
    message: string;
    icon: string;
}