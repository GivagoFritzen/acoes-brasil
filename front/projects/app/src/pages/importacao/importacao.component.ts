import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertsComponent } from '../../alerts/alerts.component';
import { FileInputComponent, SimpleButtonComponent } from '../../components';
import { OrdersService } from '../../services/orders.service';
import { ProventosService } from '../../services/proventos.service';
import { AlertItem } from '../../models/alert/alert-item.model';
import { ImportResponse } from '../../models/import-response.model';

@Component({
  selector: 'app-importacao',
  standalone: true,
  imports: [CommonModule, AlertsComponent, SimpleButtonComponent, FileInputComponent],
  templateUrl: './importacao.component.html',
  styleUrls: ['./importacao.component.scss'],
})
export class ImportacaoComponent {
  negociacaoFile = signal<File | null>(null);
  proventoFile = signal<File | null>(null);
  isImportingNegociacao = signal(false);
  isImportingProvento = signal(false);
  alerts = signal<AlertItem[]>([]);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly proventosService: ProventosService
  ) { }

  handleNegociacaoFileChange(file: File | null): void {
    this.negociacaoFile.set(file);
  }

  handleProventoFileChange(file: File | null): void {
    this.proventoFile.set(file);
  }

  importarNegociacao(): void {
    const file = this.negociacaoFile();
    if (!file) {
      this.pushAlert('warning', 'Atenção', 'Selecione um arquivo de negociação para importar.', '!');
      return;
    }

    this.isImportingNegociacao.set(true);
    this.ordersService.importOrdersSpreadsheet(file).subscribe({
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
    this.proventosService.importProventosSpreadsheet(file).subscribe({
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

  handleAlertDismiss(alert: AlertItem): void {
    this.alerts.update((items) =>
      items.filter(
        (item) =>
          item.variant !== alert.variant ||
          item.title !== alert.title ||
          item.message !== alert.message ||
          item.icon !== alert.icon
      )
    );
  }

  private pushAlert(variant: AlertItem['variant'], title: string, message: string, icon: string): void {
    this.alerts.set([{ variant, title, message, icon }]);
  }
}
