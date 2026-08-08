import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertsComponent } from '../../components/alerts/AlertsComponent';
import { SimpleButtonComponent, SimpleSelectComponent } from '../../components';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { filterAlert } from '../../utils/AlertUtils';
import { downloadBlobAsFile } from '../../utils/FileDownloadUtils';
import { OrdersService } from '../../services/OrdersService';
import { PortfolioService } from '../../services/PortfolioService';
import { SellSnapshotExportRow } from '../../models/SellSnapshotExportRowModel';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { TranslationService } from '../../services/TranslationService';
import { SelectOption } from '../../../../../../common/models/SelectOptionModel';

@Component({
  selector: 'app-exportacao',
  standalone: true,
  imports: [CommonModule, AlertsComponent, SimpleButtonComponent, SimpleSelectComponent, TranslatePipe],
  templateUrl: './ExportacaoComponent.html',
  styleUrls: ['./ExportacaoComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportacaoComponent {
  private readonly destroyRef = inject(DestroyRef);
  private printTimeout: ReturnType<typeof setTimeout> | null = null;

  isExportingAcoes = signal(false);
  isExportingOrderSellExcel = signal(false);
  isExportingOrderSellPdf = signal(false);
  isExportingPortfolio = signal(false);
  alerts = signal<AlertItem[]>([]);
  anoFiltro = signal('');
  anos = this.gerarAnos();

  constructor(
    private readonly ordersService: OrdersService,
    private readonly portfolioService: PortfolioService,
    private readonly translationService: TranslationService
  ) {
    this.destroyRef.onDestroy(() => {
      if (this.printTimeout) {
        clearTimeout(this.printTimeout);
        this.printTimeout = null;
      }
    });
  }

  onAnoChange(ano: string): void {
    this.anoFiltro.set(ano);
  }

  exportarAcoesEmPdf(): void {
    const frame = document.getElementById('print-acoes-frame') as HTMLIFrameElement | null;

    if (!frame) {
      this.pushAlert('error', this.translationService.get('common.alerts.error'), this.translationService.get('exportacao.alerts.prepareAcoesFailed'), '✕');
      return;
    }

    this.isExportingAcoes.set(true);

    const tryPrint = () => {
      try {
        if (!frame.contentWindow) {
          throw new Error();
        }

        frame.contentWindow.focus();
        frame.contentWindow.print();
        this.pushAlert('info', this.translationService.get('common.alerts.success'), this.translationService.get('exportacao.alerts.pdfStarted'), '✓');
      } catch {
        this.pushAlert('error', this.translationService.get('common.alerts.error'), this.translationService.get('exportacao.alerts.pdfPrintFailed'), '✕');
      } finally {
        this.isExportingAcoes.set(false);
      }
    };

    const onLoaded = () => {
      frame.removeEventListener('load', onLoaded);
      this.printTimeout = setTimeout(tryPrint, 500);
    };

    frame.addEventListener('load', onLoaded);
    frame.src = `/acoes?print=1&t=${Date.now()}`;
  }

  exportarPortfolioExcel(): void {
    this.isExportingPortfolio.set(true);

    this.portfolioService.exportPortfolioSpreadsheet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (blob) => {
        downloadBlobAsFile(blob, `portfolio-${Date.now()}.xlsx`);
        this.pushAlert('info', this.translationService.get('common.alerts.success'), this.translationService.get('exportacao.alerts.portfolioExcelDone'), '✓');
      },
      error: () => {
        this.pushAlert('error', this.translationService.get('common.alerts.error'), this.translationService.get('exportacao.alerts.portfolioExcelFailed'), '✕');
      },
      complete: () => {
        this.isExportingPortfolio.set(false);
      },
    });
  }

  exportarOrderSellExcel(): void {
    this.isExportingOrderSellExcel.set(true);

    this.ordersService.exportSellSnapshotsSpreadsheet(this.anoFiltro())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (blob) => {
        downloadBlobAsFile(blob, `ordersell-${Date.now()}.xlsx`);
        this.pushAlert('info', this.translationService.get('common.alerts.success'), this.translationService.get('exportacao.alerts.orderSellExcelDone'), '✓');
      },
      error: () => {
        this.pushAlert('error', this.translationService.get('common.alerts.error'), this.translationService.get('exportacao.alerts.orderSellExcelFailed'), '✕');
      },
      complete: () => {
        this.isExportingOrderSellExcel.set(false);
      },
    });
  }

  exportarOrderSellPdf(): void {
    const frame = document.getElementById('print-ordersell-frame') as HTMLIFrameElement | null;

    if (!frame) {
      this.pushAlert('error', this.translationService.get('common.alerts.error'), this.translationService.get('exportacao.alerts.prepareOrderSellFailed'), '✕');
      return;
    }

    this.isExportingOrderSellPdf.set(true);

    this.ordersService.getSellSnapshotsForPdf(this.anoFiltro())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (rows) => {
        const html = this.buildOrderSellPrintHtml(rows);
        frame.srcdoc = html;

        const tryPrint = () => {
          try {
            if (!frame.contentWindow) {
              throw new Error();
            }

            frame.contentWindow.focus();
            frame.contentWindow.print();
            this.pushAlert('info', this.translationService.get('common.alerts.success'), this.translationService.get('exportacao.alerts.orderSellPdfStarted'), '✓');
          } catch {
            this.pushAlert('error', this.translationService.get('common.alerts.error'), this.translationService.get('exportacao.alerts.orderSellPdfPrintFailed'), '✕');
          } finally {
            this.isExportingOrderSellPdf.set(false);
          }
        };

        const onLoaded = () => {
          frame.removeEventListener('load', onLoaded);
          this.printTimeout = setTimeout(tryPrint, 300);
        };

        frame.addEventListener('load', onLoaded);
      },
      error: () => {
        this.pushAlert('error', this.translationService.get('common.alerts.error'), this.translationService.get('exportacao.alerts.orderSellDataLoadFailed'), '✕');
        this.isExportingOrderSellPdf.set(false);
      },
    });
  }

  handleAlertDismiss(alert: AlertItem): void {
    this.alerts.update((items) => items.filter(filterAlert(alert)));
  }

  private gerarAnos(): SelectOption[] {
    const anoAtual = new Date().getFullYear();
    const anos: SelectOption[] = [];
    const ANO_MINIMO = 2020;
    for (let ano = anoAtual; ano >= ANO_MINIMO; ano--) {
      anos.push({ value: String(ano), label: String(ano) });
    }
    return anos;
  }

  private pushAlert(variant: AlertItem['variant'], title: string, message: string, icon: string): void {
    this.alerts.set([{ variant, title, message, icon }]);
  }

  private buildOrderSellPrintHtml(rows: SellSnapshotExportRow[]): string {
    const escapeHtml = (value: string | number): string =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatNumber = (value: number): string =>
      Number(value ?? 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const tableRows = rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.codigo)}</td>
            <td>${formatNumber(row.precoMedioAtual)}</td>
            <td>${escapeHtml(row.quantidade)}</td>
            <td>${formatNumber(row.valorAtualAcao)}</td>
            <td>${formatNumber(row.ganhos)}</td>
            <td>${escapeHtml(row.data)}</td>
          </tr>
        `
      )
      .join('');

    return `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>${this.translationService.get('exportacao.pdf.title')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 16px; font-size: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f1f5f9; }
            @page { size: A4 landscape; margin: 10mm; }
          </style>
        </head>
        <body>
          <h1>${this.translationService.get('exportacao.pdf.reportTitle')}</h1>
          <table>
            <thead>
              <tr>
                <th>${this.translationService.get('exportacao.pdf.headerCodigo')}</th>
                <th>${this.translationService.get('exportacao.pdf.headerPrecoMedioAtual')}</th>
                <th>${this.translationService.get('exportacao.pdf.headerQuantidade')}</th>
                <th>${this.translationService.get('exportacao.pdf.headerValorAtualAcao')}</th>
                <th>${this.translationService.get('exportacao.pdf.headerGanhos')}</th>
                <th>${this.translationService.get('exportacao.pdf.headerData')}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }
}