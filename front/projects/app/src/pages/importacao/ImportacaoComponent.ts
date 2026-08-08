import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertsComponent } from '../../components/alerts/AlertsComponent';
import { FileInputComponent, SimpleButtonComponent } from '../../components';
import { OrdersService } from '../../services/OrdersService';
import { PortfolioService } from '../../services/PortfolioService';
import { ProventosService } from '../../services/ProventosService';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { filterAlert } from '../../utils/AlertUtils';
import { ImportResponse } from '../../models/ImportResponseModel';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { TranslationService } from '../../services/TranslationService';

@Component({
  selector: 'app-importacao',
  standalone: true,
  imports: [CommonModule, AlertsComponent, SimpleButtonComponent, FileInputComponent, TranslatePipe],
  templateUrl: './ImportacaoComponent.html',
  styleUrls: ['./ImportacaoComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportacaoComponent {
  private readonly destroyRef = inject(DestroyRef);
  negociacaoFile = signal<File | null>(null);
  proventoFile = signal<File | null>(null);
  portfolioFile = signal<File | null>(null);
  isImportingNegociacao = signal(false);
  isImportingProvento = signal(false);
  isImportingPortfolio = signal(false);
  alerts = signal<AlertItem[]>([]);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly portfolioService: PortfolioService,
    private readonly proventosService: ProventosService,
    private readonly translationService: TranslationService
  ) { }

  handleNegociacaoFileChange(file: File | null): void {
    this.negociacaoFile.set(file);
  }

  handleProventoFileChange(file: File | null): void {
    this.proventoFile.set(file);
  }

  handlePortfolioFileChange(file: File | null): void {
    this.portfolioFile.set(file);
  }

  importarNegociacao(): void {
    const file = this.negociacaoFile();
    if (!file) {
      this.pushAlert('warning', this.translationService.get('common.alerts.attention'), this.translationService.get('importacao.alerts.selectNegociacaoFile'), '!');
      return;
    }

    this.isImportingNegociacao.set(true);
    this.ordersService.importOrdersSpreadsheet(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ImportResponse) => {
          this.pushAlert('info', this.translationService.get('common.alerts.success'), `${response.imported}${this.translationService.get('importacao.alerts.negociacaoSuccess')}`, '✓');
          this.negociacaoFile.set(null);
          this.isImportingNegociacao.set(false);
        },
        error: (error: HttpErrorResponse) => {
          const message = error?.error?.error ?? error?.error?.message ?? this.translationService.get('importacao.errors.negociacaoImportFailed');
          this.pushAlert('error', this.translationService.get('common.alerts.error'), message, '✕');
          this.isImportingNegociacao.set(false);
        },
      });
  }

  importarProventos(): void {
    const file = this.proventoFile();
    if (!file) {
      this.pushAlert('warning', this.translationService.get('common.alerts.attention'), this.translationService.get('importacao.alerts.selectProventoFile'), '!');
      return;
    }

    this.isImportingProvento.set(true);
    this.proventosService.importProventosSpreadsheet(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ImportResponse) => {
          this.pushAlert('info', this.translationService.get('common.alerts.success'), `${response.imported}${this.translationService.get('importacao.alerts.proventoSuccess')}`, '✓');
          this.proventoFile.set(null);
          this.isImportingProvento.set(false);
        },
        error: (error: HttpErrorResponse) => {
          const message = error?.error?.error ?? error?.error?.message ?? this.translationService.get('importacao.errors.proventoImportFailed');
          this.pushAlert('error', this.translationService.get('common.alerts.error'), message, '✕');
          this.isImportingProvento.set(false);
        },
      });
  }

  importarPortfolio(): void {
    const file = this.portfolioFile();
    if (!file) {
      this.pushAlert('warning', this.translationService.get('common.alerts.attention'), this.translationService.get('importacao.alerts.selectPortfolioFile'), '!');
      return;
    }

    this.isImportingPortfolio.set(true);
    this.portfolioService.importPortfolioSpreadsheet(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ImportResponse) => {
          this.pushAlert('info', this.translationService.get('common.alerts.success'), `${response.imported}${this.translationService.get('importacao.alerts.portfolioSuccess')}`, '✓');
          this.portfolioFile.set(null);
          this.isImportingPortfolio.set(false);
        },
        error: (error: HttpErrorResponse) => {
          const message = error?.error?.error ?? error?.error?.message ?? this.translationService.get('importacao.errors.portfolioImportFailed');
          this.pushAlert('error', this.translationService.get('common.alerts.error'), message, '✕');
          this.isImportingPortfolio.set(false);
        },
      });
  }

  handleAlertDismiss(alert: AlertItem): void {
    this.alerts.update((items) => items.filter(filterAlert(alert)));
  }

  private pushAlert(variant: AlertItem['variant'], title: string, message: string, icon: string): void {
    this.alerts.set([{ variant, title, message, icon }]);
  }
}
