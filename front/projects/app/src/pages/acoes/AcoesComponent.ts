import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertsComponent } from '../../components/alerts/AlertsComponent';
import { ActionButtonComponent, AddPortfolioModalComponent, SimpleButtonComponent } from '../../components';
import { PortfolioPieChartComponent } from '../../components/portfolio-pie-chart/PortfolioPieChartComponent';
import { PortfolioItem } from '../../models';
import { PortfolioProfitLossChartComponent } from '../../components/portfolio-profit-loss-chart/PortfolioProfitLossChartComponent';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { PortfolioService } from '../../services/PortfolioService';
import { CreatePortfolioPayload } from '../../models/CreatePortfolioPayloadModel';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { SettingsService } from '../../services/SettingsService';
import { mesclarPorCodigo, removerSufixoF } from '../../../../../../common/utils/OrderCodigoUtils';

@Component({
    selector: 'app-acoes',
    standalone: true,
    imports: [
        CommonModule,
        AlertsComponent,
        SimpleButtonComponent,
        ActionButtonComponent,
        AddPortfolioModalComponent,
        PortfolioPieChartComponent,
        PortfolioProfitLossChartComponent,
        TranslatePipe,
    ],
    templateUrl: './AcoesComponent.html',
    styleUrls: ['./AcoesComponent.scss'],
})
export class AcoesComponent implements OnInit {
    portfolios = signal<PortfolioItem[]>([]);
    isLoading = signal(false);
    isEditing = signal(false);
    isDeleteMode = signal(false);
    isDeleting = signal(false);
    isCreating = signal(false);
    errorMessage = signal('');
    alerts = signal<AlertItem[]>([]);
    isDeleteModalOpen = signal(false);
    isCreateModalOpen = signal(false);
    portfolioToDelete = signal<PortfolioItem | null>(null);

    private readonly codigoParaIdsMap = new Map<string, string[]>();

    constructor(
        private readonly portfolioService: PortfolioService,
        private readonly router: Router,
        protected readonly settingsService: SettingsService,
    ) { }

    ngOnInit(): void {
        this.loadPortfolios();
    }

    loadPortfolios(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.alerts.set([]);

        this.portfolioService
            .getPortfolios()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (portfolios) => {
                    const portfolioItems = portfolios ?? [];
                    this.portfolios.set(this.mergePortfolios(portfolioItems));
                },
                error: () => {
                    const message = 'Não foi possível carregar os portfolios.';
                    this.errorMessage.set(message);
                    this.alerts.set([
                        {
                            variant: 'error',
                            title: 'Error!',
                            message,
                            icon: '✕',
                        },
                    ]);
                }
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

    openCreateModal(): void {
        this.isCreateModalOpen.set(true);
    }

    toggleEditMode(): void {
        this.isEditing.update(v => !v);
    }

    toggleDeleteMode(): void {
        const nextValue = !this.isDeleteMode();
        this.isDeleteMode.set(nextValue);

        if (!nextValue) {
            this.closeDeleteModal();
        }
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

    confirmCreatePortfolio(payload: CreatePortfolioPayload): void {
        this.isCreating.set(true);

        this.portfolioService.createPortfolio(payload).subscribe({
            next: (portfolio) => {
                this.isCreating.set(false);
                this.closeCreateModal();
                this.alerts.set([
                    {
                        variant: 'info',
                        title: 'Sucesso',
                        message: `Ativo ${portfolio.codigo} adicionado com sucesso.`,
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
                        title: 'Error!',
                        message: 'Não foi possível adicionar o ativo ao portfólio.',
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

        this.portfolioService.deletePortfolio(ids[0]).subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.closeDeleteModal();
                this.alerts.set([
                    {
                        variant: 'info',
                        title: 'Sucesso',
                        message: `Ativo ${portfolio.codigo} removido com sucesso.`,
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
                        title: 'Error!',
                        message: 'Não foi possível deletar o ativo do portfólio.',
                        icon: '✕',
                    },
                ]);
            },
        });
    }

    goToPortfolioDetails(item: PortfolioItem): void {
        if (this.isDeleteMode()) {
            return;
        }

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