import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AlertsComponent } from '../../components/alerts/AlertsComponent';
import {
  AddProventoModalComponent,
  ActionButtonComponent,
  DatePickerComponent,
  PaginationComponent,
  SimpleButtonComponent,
  SimpleInputComponent,
  SimpleSelectComponent,
} from '../../components';
import {
  Provento,
  ProventoTipos,
  ProventoTipo,
  ProventosResponse,
} from '../../models';
import { CreateProventoPayload } from '../../models/CreateProventoPayloadModel';
import { UpdateProventoPayload } from '../../models/UpdateProventoPayloadModel';
import { SimpleCheckboxComponent } from '../../components/simple-checkbox/SimpleCheckboxComponent';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { filterAlert } from '../../utils/AlertUtils';
import type { SelectOption } from '../../../../../../common/models/SelectOptionModel';
import { ProventosService } from '../../services/ProventosService';
import { formatDateForDisplay } from '../../utils/DateUtils';
import { ProventosFilters } from '../../models/ProventosFiltersModel';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { TranslationService } from '../../services/TranslationService';

const DEFAULT_LIMIT = 10;

@Component({
  selector: 'app-proventos',
  standalone: true,
  imports: [
    CommonModule,
    AlertsComponent,
    AddProventoModalComponent,
    ActionButtonComponent,
    PaginationComponent,
    DatePickerComponent,
    SimpleInputComponent,
    SimpleSelectComponent,
    SimpleButtonComponent,
    SimpleCheckboxComponent,
    TranslatePipe,
  ],
  templateUrl: './ProventosComponent.html',
  styleUrls: ['./ProventosComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProventosComponent implements OnInit {
  private readonly proventosService = inject(ProventosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translationService = inject(TranslationService);

  readonly formatDateForDisplay = formatDateForDisplay;
  readonly proventos = signal<Provento[]>([]);
  readonly juntarPorCodigo = signal(false);

  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly isCreating = signal(false);
  readonly errorMessage = signal('');
  readonly alerts = signal<AlertItem[]>([]);
  readonly isDeleteModalOpen = signal(false);
  readonly isCreateModalOpen = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly proventoToDelete = signal<Provento | null>(null);
  readonly proventoToEdit = signal<Provento | null>(null);

  readonly tipoOptions: SelectOption<ProventoTipo>[] = [
    { label: this.translationService.get('proventos.filterDividendo'), value: ProventoTipos.Dividendo },
    { label: this.translationService.get('proventos.filterJcp'), value: ProventoTipos.JurosSobreCapitalProprio },
    { label: this.translationService.get('proventos.filterRendimento'), value: ProventoTipos.Rendimento },
  ];

  readonly filtroCodigo = signal('');
  readonly filtroTipo = signal<ProventoTipo | ''>('');
  readonly filtroData = signal('');
  readonly filtroDataFinal = signal('');

  readonly filtroCodigoAplicado = signal('');
  readonly filtroTipoAplicado = signal<ProventoTipo | ''>('');
  readonly filtroDataAplicado = signal('');
  readonly filtroDataFinalAplicado = signal('');

  readonly page = signal(1);
  readonly limit = signal(DEFAULT_LIMIT);
  readonly totalPages = signal(1);

  ngOnInit(): void {
    this.loadProventos();
  }

  handleFilterStartChange(value: string): void {
    this.filtroData.set(value);
  }

  handleFilterCodeChange(value: string): void {
    this.filtroCodigo.set(value);
  }

  handleFilterTypeChange(value: string): void {
    this.filtroTipo.set(this.toProventoTipo(value));
  }

  handleFilterEndChange(value: string): void {
    this.filtroDataFinal.set(value);
  }

  handleJuntarPorCodigoChange(value: boolean): void {
    this.juntarPorCodigo.set(value);
    this.applyFilter();
  }

  applyFilter(): void {
    this.setAppliedFiltersFromCurrent();
    this.page.set(1);
    this.loadProventos();
  }

  clearFilter(): void {
    this.resetCurrentFilters();
    this.resetAppliedFilters();
    this.juntarPorCodigo.set(false);
    this.page.set(1);
    this.loadProventos();
  }

  previousPage(): void {
    if (this.page() <= 1) {
      return;
    }

    this.page.set(this.page() - 1);
    this.loadProventos();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) {
      return;
    }

    this.page.set(this.page() + 1);
    this.loadProventos();
  }

  handleAlertDismiss(alert: AlertItem): void {
    this.alerts.update((items) => items.filter(filterAlert(alert)));
  }

  formatTipo(tipo: ProventoTipo): string {
    const tipoFormatado = tipo.toLowerCase();
    if (tipoFormatado === ProventoTipos.JurosSobreCapitalProprio.toLowerCase()) {
      return 'JCP';
    }

    if (tipoFormatado === ProventoTipos.Dividendo.toLowerCase()) {
      return ProventoTipos.Dividendo;
    }

    if (tipoFormatado === ProventoTipos.Rendimento.toLowerCase()) {
      return ProventoTipos.Rendimento;
    }

    return tipo;
  }

  trackByProventoId(_: number, item: Provento): string {
    return item.id;
  }

  openDeleteModal(provento: Provento): void {
    this.proventoToDelete.set(provento);
    this.isDeleteModalOpen.set(true);
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) {
      return;
    }

    this.isDeleteModalOpen.set(false);
    this.proventoToDelete.set(null);
  }

  closeCreateModal(): void {
    if (this.isCreating()) {
      return;
    }

    this.isCreateModalOpen.set(false);
  }

  openEditModal(provento: Provento): void {
    this.proventoToEdit.set(provento);
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    if (this.isCreating()) {
      return;
    }

    this.isEditModalOpen.set(false);
    this.proventoToEdit.set(null);
  }

  confirmCreateProvento(payload: CreateProventoPayload): void {
    this.isCreating.set(true);

    this.proventosService
      .createProvento(payload)
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
          this.isCreateModalOpen.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (provento: Provento) => {
          this.alerts.set([
            {
              variant: 'info',
              title: this.translationService.get('common.alerts.success'),
              message: `${this.translationService.get('proventos.alerts.created')} ${provento.codigo}`,
              icon: '✓',
            },
          ]);
          this.loadProventos();
        },
        error: (error: HttpErrorResponse) => {
          const message = this.extractCreateProventoErrorMessage(error);
          this.alerts.set([this.createErrorAlert(message)]);
        },
      });
  }

  confirmDeleteProvento(): void {
    const provento = this.proventoToDelete();
    if (!provento) {
      return;
    }

    this.isDeleting.set(true);

    const deleteObservable = this.juntarPorCodigo()
      ? this.proventosService.deleteProventosByCodigo(provento.codigo)
      : this.proventosService.deleteProvento(provento.id);

    deleteObservable
      .pipe(
        finalize(() => {
          this.isDeleting.set(false);
          this.isDeleteModalOpen.set(false);
          this.proventoToDelete.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.alerts.set([
            {
              variant: 'info',
              title: this.translationService.get('common.alerts.success'),
              message: this.juntarPorCodigo()
                ? `${this.translationService.get('proventos.alerts.deletedGroup')} ${provento.codigo}`
                : `${this.translationService.get('proventos.alerts.deletedSingle')} ${provento.codigo}`,
              icon: '✓',
            },
          ]);
          this.loadProventos();
        },
        error: () => {
          this.alerts.set([this.createErrorAlert(this.translationService.get('proventos.alerts.deleteFailed'))]);
        },
      });
  }

  confirmEditProvento(payload: UpdateProventoPayload): void {
    const provento = this.proventoToEdit();
    if (!provento) {
      return;
    }

    this.isCreating.set(true);

    this.proventosService
      .updateProvento(provento.id, payload)
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
          this.isEditModalOpen.set(false);
          this.proventoToEdit.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated: Provento) => {
          this.alerts.set([
            {
              variant: 'info',
              title: this.translationService.get('common.alerts.success'),
              message: `${this.translationService.get('proventos.alerts.updated')} ${updated.codigo}`,
              icon: '✓',
            },
          ]);
          this.loadProventos();
        },
        error: () => {
          this.alerts.set([this.createErrorAlert(this.translationService.get('proventos.alerts.createFailed'))]);
        },
      });
  }

  private loadProventos(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.alerts.set([]);
    const filtrosAplicados = this.getAppliedFilters();

    this.proventosService
      .getProventos({
        codigo: filtrosAplicados.codigo || undefined,
        tipo: filtrosAplicados.tipo || undefined,
        dataInicial: filtrosAplicados.dataInicial || undefined,
        dataFinal: filtrosAplicados.dataFinal || undefined,
        agruparPorCodigo: filtrosAplicados.agruparPorCodigo,
        page: this.page(),
        limit: this.limit(),
      })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response: ProventosResponse) => {
          this.proventos.set(response.data ?? []);
          this.page.set(response.page);
          this.limit.set(response.limit);
          this.totalPages.set(response.totalPages);
        },
        error: () => {
          this.errorMessage.set(this.translationService.get('proventos.alerts.loadFailed'));
          this.alerts.set([this.createErrorAlert(this.translationService.get('proventos.alerts.loadFailed'))]);
        },
      });
  }

  private getAppliedFilters(): ProventosFilters {
    return {
      codigo: this.filtroCodigoAplicado(),
      tipo: this.filtroTipoAplicado(),
      dataInicial: this.filtroDataAplicado(),
      dataFinal: this.filtroDataFinalAplicado(),
      agruparPorCodigo: this.juntarPorCodigo(),
    };
  }

  private setAppliedFiltersFromCurrent(): void {
    this.filtroCodigoAplicado.set(this.filtroCodigo());
    this.filtroTipoAplicado.set(this.filtroTipo());
    this.filtroDataAplicado.set(this.filtroData());
    this.filtroDataFinalAplicado.set(this.filtroDataFinal());
  }

  private resetCurrentFilters(): void {
    this.filtroCodigo.set('');
    this.filtroTipo.set('');
    this.filtroData.set('');
    this.filtroDataFinal.set('');
  }

  private resetAppliedFilters(): void {
    this.filtroCodigoAplicado.set('');
    this.filtroTipoAplicado.set('');
    this.filtroDataAplicado.set('');
    this.filtroDataFinalAplicado.set('');
  }

  private extractCreateProventoErrorMessage(error: HttpErrorResponse): string {
    const errorResponse = error.error as { message?: string } | null;
    return errorResponse?.message ?? this.translationService.get('proventos.alerts.createFailed');
  }

  private toProventoTipo(value: string): ProventoTipo | '' {
    if (value === '') {
      return '';
    }

    return this.isProventoTipo(value) ? value : '';
  }

  private isProventoTipo(value: string): value is ProventoTipo {
    return this.tipoOptions.some((option) => option.value === value);
  }

  private createErrorAlert(message: string): AlertItem {
    return {
      variant: 'error',
      title: this.translationService.get('common.alerts.error'),
      message,
      icon: '✕',
    };
  }
}