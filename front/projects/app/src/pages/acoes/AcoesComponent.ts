import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AlertsComponent } from '../../components/alerts/AlertsComponent';
import { AddPortfolioModalComponent, SimpleButtonComponent } from '../../components';
import { PortfolioPieChartComponent } from '../../components/portfolio-pie-chart/PortfolioPieChartComponent';
import { PortfolioItem } from '../../models';
import { PortfolioProfitLossChartComponent } from '../../components/portfolio-profit-loss-chart/PortfolioProfitLossChartComponent';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { filterAlert } from '../../utils/AlertUtils';
import { PortfolioService } from '../../services/PortfolioService';
import { CreatePortfolioPayload } from '../../models/CreatePortfolioPayloadModel';
import { UpdatePortfolioPayload } from '../../models/UpdatePortfolioPayloadModel';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { TranslationService } from '../../services/TranslationService';
import { SettingsService } from '../../services/SettingsService';
import { mesclarPorCodigo, removerSufixoF } from '../../../../../../common/utils/OrderCodigoUtils';

@Component({
    selector: 'app-acoes',
    standalone: true,
    imports: [
        CommonModule,
        AlertsComponent,
        SimpleButtonComponent,
        AddPortfolioModalComponent,
        PortfolioPieChartComponent,
        PortfolioProfitLossChartComponent,
        TranslatePipe,
    ],
    templateUrl: './AcoesComponent.html',
    styleUrls: ['./AcoesComponent.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcoesComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    readonly portfolios = signal<PortfolioItem[]>([]);
    readonly isLoading = signal(false);
    readonly isDeleting = signal(false);
    readonly isCreating = signal(false);
    readonly isEditing = signal(false);
    readonly errorMessage = signal('');
    readonly alerts = signal<AlertItem[]>([]);
    readonly isDeleteModalOpen = signal(false);
    readonly isCreateModalOpen = signal(false);
    readonly isEditModalOpen = signal(false);
    readonly portfolioToDelete = signal<PortfolioItem | null>(null);
    readonly portfolioToEdit = signal<PortfolioItem | null>(null);
    readonly openDropdownIndex = signal<number | null>(null);

    private readonly codigoParaIdsMap = new Map<string, string[]>();

    constructor(
        private readonly portfolioService: PortfolioService,
        private readonly router: Router,
        protected readonly settingsService: SettingsService,
        private readonly translationService: TranslationService
    ) { }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.acoes__dropdown-container')) {
            this.openDropdownIndex.set(null);
        }
    }

    ngOnInit(): void {
        this.loadPortfolios();
    }

    loadPortfolios(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.alerts.set([]);

        this.portfolioService
            .getPortfolios()
            .pipe(
                finalize(() => this.isLoading.set(false)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (portfolios) => {
                    const portfolioItems = portfolios ?? [];
                    this.portfolios.set(this.mergePortfolios(portfolioItems));
                },
                error: () => {
                    const message = this.translationService.get('acoes.alerts.loadPortfoliosFailed');
                    this.errorMessage.set(message);
                    this.alerts.set([
                        {
                            variant: 'error',
                            title: this.translationService.get('common.alerts.error'),
                            message,
                            icon: '✕',
                        },
                    ]);
                }
            });
    }

    handleAlertDismiss(alert: AlertItem): void {
        this.alerts.update((items) => items.filter(filterAlert(alert)));
    }

    openCreateModal(): void {
        this.isCreateModalOpen.set(true);
    }

    toggleDropdown(index: number): void {
        if (this.openDropdownIndex() === index) {
            this.openDropdownIndex.set(null);
        } else {
            this.openDropdownIndex.set(index);
        }
    }

    closeDropdown(): void {
        this.openDropdownIndex.set(null);
    }

    openDeleteModal(item: PortfolioItem): void {
        this.portfolioToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    closeDeleteModal(): void {
        if (this.isDeleting()) {
            return;
        }

        this.isDeleteModalOpen.set(false);
        this.portfolioToDelete.set(null);
    }

    closeCreateModal(): void {
        if (this.isCreating()) {
            return;
        }

        this.isCreateModalOpen.set(false);
    }

    openEditModal(item: PortfolioItem): void {
        this.portfolioToEdit.set(item);
        this.isEditModalOpen.set(true);
    }

    closeEditModal(): void {
        if (this.isCreating()) {
            return;
        }

        this.isEditModalOpen.set(false);
        this.portfolioToEdit.set(null);
    }

    confirmCreatePortfolio(payload: CreatePortfolioPayload): void {
        this.isCreating.set(true);

        this.portfolioService.createPortfolio(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (portfolio) => {
                this.isCreating.set(false);
                this.closeCreateModal();
                this.alerts.set([
                    {
                        variant: 'info',
                        title: this.translationService.get('common.alerts.success'),
                        message: `${this.translationService.get('acoes.alerts.assetCreated')} ${portfolio.codigo}`,
                        icon: '✓',
                    },
                ]);
                this.loadPortfolios();
            },
            error: () => {
                this.isCreating.set(false);
                this.alerts.set([
                    {
                        variant: 'error',
                        title: this.translationService.get('common.alerts.error'),
                        message: this.translationService.get('acoes.alerts.addAssetFailed'),
                        icon: '✕',
                    },
                ]);
            },
        });
    }

    confirmEditPortfolio(payload: UpdatePortfolioPayload): void {
        const portfolio = this.portfolioToEdit();
        if (!portfolio) {
            return;
        }

        this.isEditing.set(true);

        const ids = this.codigoParaIdsMap.get(portfolio.codigo) ?? [portfolio.id];

        this.portfolioService.updatePortfolio(ids[0], payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                this.isEditing.set(false);
                this.closeEditModal();
                this.alerts.set([
                    {
                        variant: 'info',
                        title: this.translationService.get('common.alerts.success'),
                        message: `${this.translationService.get('acoes.alerts.assetUpdated')} ${updated.codigo}`,
                        icon: '✓',
                    },
                ]);
                this.loadPortfolios();
            },
            error: () => {
                this.isEditing.set(false);
                this.alerts.set([
                    {
                        variant: 'error',
                        title: this.translationService.get('common.alerts.error'),
                        message: this.translationService.get('acoes.alerts.updateAssetFailed'),
                        icon: '✕',
                    },
                ]);
            },
        });
    }

    confirmDeletePortfolio(): void {
        const portfolio = this.portfolioToDelete();
        if (!portfolio) {
            return;
        }

        this.isDeleting.set(true);

        const ids = this.codigoParaIdsMap.get(portfolio.codigo) ?? [portfolio.id];

        this.portfolioService.deletePortfolio(ids[0])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.closeDeleteModal();
                this.alerts.set([
                    {
                        variant: 'info',
                        title: this.translationService.get('common.alerts.success'),
                        message: `${this.translationService.get('acoes.alerts.assetDeleted')} ${portfolio.codigo}`,
                        icon: '✓',
                    },
                ]);
                this.loadPortfolios();
            },
            error: () => {
                this.isDeleting.set(false);
                this.alerts.set([
                    {
                        variant: 'error',
                        title: this.translationService.get('common.alerts.error'),
                        message: this.translationService.get('acoes.alerts.deleteAssetFailed'),
                        icon: '✕',
                    },
                ]);
            },
        });
    }

    goToPortfolioDetails(item: PortfolioItem): void {
        this.router.navigate(['/acoes', item.codigo]);
    }

    goToPersonalizar(): void {
        this.router.navigate(['/personalizar']);
    }

    private mergePortfolios(items: PortfolioItem[]): PortfolioItem[] {
        this.codigoParaIdsMap.clear();

        for (const item of items) {
            const chave = removerSufixoF(item.codigo);
            if (!this.codigoParaIdsMap.has(chave)) {
                this.codigoParaIdsMap.set(chave, []);
            }
            this.codigoParaIdsMap.get(chave)!.push(item.id);
        }

        return mesclarPorCodigo(items);
    }
}