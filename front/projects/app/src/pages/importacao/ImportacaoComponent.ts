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
    private readonly proventosService: ProventosService
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
      this.pushAlert('warning', 'Atenção', 'Selecione um arquivo de negociação para importar.', '!');
      return;
    }

    this.isImportingNegociacao.set(true);
    this.ordersService.importOrdersSpreadsheet(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ImportResponse) => {
          this.pushAlert('info', 'Sucesso', `${response.imported} negociações importadas com sucesso.`, '✓');
          this.negociacaoFile.set(null);
          this.isImportingNegociacao.set(false);
        },
        error: (error: HttpErrorResponse) => {
          const message = error?.error?.error ?? error?.error?.message ?? 'Não foi possível importar a planilha de negociação.';
          this.pushAlert('error', 'Erro', message, '✕');
          this.isImportingNegociacao.set(false);
        },
      });
  }

  importarProventos(): void {
    const file = this.proventoFile();
    if (!file) {
      this.pushAlert('warning', 'Atenção', 'Selecione um arquivo de proventos para importar.', '!');
      return;
    }

    this.isImportingProvento.set(true);
    this.proventosService.importProventosSpreadsheet(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ImportResponse) => {
          this.pushAlert('info', 'Sucesso', `${response.imported} proventos importados com sucesso.`, '✓');
          this.proventoFile.set(null);
          this.isImportingProvento.set(false);
        },
        error: (error: HttpErrorResponse) => {
          const message = error?.error?.error ?? error?.error?.message ?? 'Não foi possível importar a planilha de proventos.';
          this.pushAlert('error', 'Erro', message, '✕');
          this.isImportingProvento.set(false);
        },
      });
  }

  importarPortfolio(): void {
    const file = this.portfolioFile();
    if (!file) {
      this.pushAlert('warning', 'Atenção', 'Selecione um arquivo de portfólio para importar.', '!');
      return;
    }

    this.isImportingPortfolio.set(true);
    this.portfolioService.importPortfolioSpreadsheet(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ImportResponse) => {
          this.pushAlert('info', 'Sucesso', `${response.imported} itens de portfólio importados com sucesso.`, '✓');
          this.portfolioFile.set(null);
          this.isImportingPortfolio.set(false);
        },
        error: (error: HttpErrorResponse) => {
          const message = error?.error?.error ?? error?.error?.message ?? 'Não foi possível importar a planilha de portfólio.';
          this.pushAlert('error', 'Erro', message, '✕');
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
