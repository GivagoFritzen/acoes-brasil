import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AlertsComponent } from '../../components/alerts/AlertsComponent';
import { SimpleButtonComponent, SimpleSelectComponent } from '../../components';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { OrdersService } from '../../services/OrdersService';
import { SellSnapshotExportRow } from '../../models/SellSnapshotExportRowModel';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { SelectOption } from '../../../../../../common/models/SelectOptionModel';

@Component({
  selector: 'app-exportacao',
  standalone: true,
  imports: [CommonModule, AlertsComponent, SimpleButtonComponent, SimpleSelectComponent, TranslatePipe],
  templateUrl: './ExportacaoComponent.html',
  styleUrls: ['./ExportacaoComponent.scss'],
})
export class ExportacaoComponent {
  isExportingAcoes = signal(false);
  isExportingOrderSellExcel = signal(false);
  isExportingOrderSellPdf = signal(false);
  alerts = signal<AlertItem[]>([]);
  anoFiltro = signal('');
  anos = this.gerarAnos();

  constructor(private readonly ordersService: OrdersService) { }

  onAnoChange(ano: string): void {
    this.anoFiltro.set(ano);
  }

  private gerarAnos(): SelectOption[] {
    const anoAtual = new Date().getFullYear();
    const anos: SelectOption[] = [];
    for (let i = anoAtual; i >= 2020; i--) {
      anos.push({ value: String(i), label: String(i) });
    }
    return anos;
  }

  exportarAcoesEmPdf(): void {
    const frame = document.getElementById('print-acoes-frame') as HTMLIFrameElement | null;

    if (!frame) {
      this.pushAlert('error', 'Erro', 'Não foi possível preparar a exportação da página de ações.', '✕');
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
        this.pushAlert('info', 'Sucesso', 'Exportação iniciada. Salve como PDF no diálogo de impressão.', '✓');
      } catch {
        this.pushAlert('error', 'Erro', 'Não foi possível iniciar a exportação em PDF.', '✕');
      } finally {
        this.isExportingAcoes.set(false);
      }
    };

    const onLoaded = () => {
      frame.removeEventListener('load', onLoaded);
      setTimeout(tryPrint, 500);
    };

    frame.addEventListener('load', onLoaded);
    frame.src = `/acoes?print=1&t=${Date.now()}`;
  }

  exportarOrderSellExcel(): void {
    this.isExportingOrderSellExcel.set(true);

    this.ordersService.exportSellSnapshotsSpreadsheet(this.anoFiltro()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `ordersell-${Date.now()}.xlsx`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        this.pushAlert('info', 'Sucesso', 'Exportação de OrderSell em Excel concluída.', '✓');
      },
      error: () => {
        this.pushAlert('error', 'Erro', 'Não foi possível exportar o OrderSell em Excel.', '✕');
      },
      complete: () => {
        this.isExportingOrderSellExcel.set(false);
      },
    });
  }

  exportarOrderSellPdf(): void {
    const frame = document.getElementById('print-ordersell-frame') as HTMLIFrameElement | null;

    if (!frame) {
      this.pushAlert('error', 'Erro', 'Não foi possível preparar a exportação de OrderSell.', '✕');
      return;
    }

    this.isExportingOrderSellPdf.set(true);

    this.ordersService.getSellSnapshotsForPdf(this.anoFiltro()).subscribe({
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
            this.pushAlert('info', 'Sucesso', 'Exportação de OrderSell em PDF iniciada.', '✓');
          } catch {
            this.pushAlert('error', 'Erro', 'Não foi possível iniciar a exportação de OrderSell em PDF.', '✕');
          } finally {
            this.isExportingOrderSellPdf.set(false);
          }
        };

        const onLoaded = () => {
          frame.removeEventListener('load', onLoaded);
          setTimeout(tryPrint, 300);
        };

        frame.addEventListener('load', onLoaded);
      },
      error: () => {
        this.pushAlert('error', 'Erro', 'Não foi possível carregar os dados de OrderSell para o PDF.', '✕');
        this.isExportingOrderSellPdf.set(false);
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

  private buildOrderSellPrintHtml(rows: SellSnapshotExportRow[]): string {
    const escapeHtml = (value: unknown): string =>
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
          <title>OrderSell - Exportação PDF</title>
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
          <h1>OrderSell - Relatório</h1>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>precoMedioAtual</th>
                <th>Quantidade</th>
                <th>valorAtualAcao</th>
                <th>ganhos</th>
                <th>data</th>
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