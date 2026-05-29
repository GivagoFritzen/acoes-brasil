import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface TourStep {
  route: string;
  titleKey: string;
  descKey: string;
  elementSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STORAGE_KEY = 'tour_was_shown';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  readonly isActive = signal(false);
  readonly currentStepIndex = signal(0);

  readonly steps = signal<TourStep[]>([
    {
      route: '/acoes',
      titleKey: 'tour.sidebarAcoesTitle',
      descKey: 'tour.sidebarAcoesDesc',
      elementSelector: '[data-tour="sidebar-acoes"]',
      position: 'right',
    },
    {
      route: '/acoes',
      titleKey: 'tour.acoesTitle',
      descKey: 'tour.acoesDesc',
      elementSelector: '[data-tour="acoes-title"]',
      position: 'bottom',
    },
    {
      route: '/acoes',
      titleKey: 'tour.acoesTableTitle',
      descKey: 'tour.acoesTableDesc',
      elementSelector: '[data-tour="acoes-table"]',
      position: 'top',
    },
    {
      route: '/acoes',
      titleKey: 'tour.acoesCompositionTitle',
      descKey: 'tour.acoesCompositionDesc',
      elementSelector: '[data-tour="acoes-composition"]',
      position: 'left',
    },
    {
      route: '/acoes',
      titleKey: 'tour.acoesProfitabilityTitle',
      descKey: 'tour.acoesProfitabilityDesc',
      elementSelector: '[data-tour="acoes-profitability"]',
      position: 'right',
    },
    {
      route: '/ordens',
      titleKey: 'tour.sidebarOrdensTitle',
      descKey: 'tour.sidebarOrdensDesc',
      elementSelector: '[data-tour="sidebar-ordens"]',
      position: 'right',
    },
    {
      route: '/ordens',
      titleKey: 'tour.ordensTitle',
      descKey: 'tour.ordensDesc',
      elementSelector: '[data-tour="ordens-title"]',
      position: 'bottom',
    },
    {
      route: '/ordens',
      titleKey: 'tour.ordensFiltersTitle',
      descKey: 'tour.ordensFiltersDesc',
      elementSelector: '[data-tour="ordens-filters"]',
      position: 'top',
    },
    {
      route: '/proventos',
      titleKey: 'tour.sidebarProventosTitle',
      descKey: 'tour.sidebarProventosDesc',
      elementSelector: '[data-tour="sidebar-proventos"]',
      position: 'right',
    },
    {
      route: '/proventos',
      titleKey: 'tour.proventosTitle',
      descKey: 'tour.proventosDesc',
      elementSelector: '[data-tour="proventos-title"]',
      position: 'bottom',
    },
    {
      route: '/importacao',
      titleKey: 'tour.sidebarImportacaoTitle',
      descKey: 'tour.sidebarImportacaoDesc',
      elementSelector: '[data-tour="sidebar-importacao"]',
      position: 'right',
    },
    {
      route: '/importacao',
      titleKey: 'tour.importacaoTitle',
      descKey: 'tour.importacaoDesc',
      elementSelector: '[data-tour="importacao-title"]',
      position: 'bottom',
    },
    {
      route: '/exportacao',
      titleKey: 'tour.sidebarExportacaoTitle',
      descKey: 'tour.sidebarExportacaoDesc',
      elementSelector: '[data-tour="sidebar-exportacao"]',
      position: 'right',
    },
    {
      route: '/exportacao',
      titleKey: 'tour.exportacaoTitle',
      descKey: 'tour.exportacaoDesc',
      elementSelector: '[data-tour="exportacao-title"]',
      position: 'bottom',
    },
  ]);

  constructor(private readonly router: Router) {}

  get currentStep(): TourStep | undefined {
    const idx = this.currentStepIndex();
    const allSteps = this.steps();
    return idx >= 0 && idx < allSteps.length ? allSteps[idx] : undefined;
  }

  get totalSteps(): number {
    return this.steps().length;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex() >= this.totalSteps - 1;
  }

  get isFirstStep(): boolean {
    return this.currentStepIndex() === 0;
  }

  get wasShown(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  start(): void {
    this.currentStepIndex.set(0);
    this.isActive.set(true);
    this.navigateToStep(0);
  }

  next(): void {
    const nextIdx = this.currentStepIndex() + 1;
    if (nextIdx < this.totalSteps) {
      this.currentStepIndex.set(nextIdx);
      this.navigateToStep(nextIdx);
    }
  }

  prev(): void {
    const prevIdx = this.currentStepIndex() - 1;
    if (prevIdx >= 0) {
      this.currentStepIndex.set(prevIdx);
      this.navigateToStep(prevIdx);
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.totalSteps) {
      this.currentStepIndex.set(index);
      this.navigateToStep(index);
    }
  }

  finish(): void {
    this.isActive.set(false);
    this.currentStepIndex.set(0);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch { /* noop */ }
  }

  private navigateToStep(index: number): void {
    const step = this.steps()[index];
    if (step) {
      this.router.navigate([step.route]);
    }
  }
}
