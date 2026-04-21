import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertsComponent } from '../../alerts/alerts.component';
import { ActionButtonComponent, AddPortfolioModalComponent, SimpleButtonComponent } from '../../components';
import { PortfolioPieChartComponent } from '../../components/portfolio-pie-chart/portfolio-pie-chart.component';
import { PortfolioItem } from '../../models';
import { PortfolioProfitLossChartComponent } from '../../components/portfolio-profit-loss-chart/portfolio-profit-loss-chart.component';
import { AlertItem } from '../../models/alert/alert-item.model';
import { PortfolioService } from '../../services/portfolio.service';
import { CreatePortfolioPayload } from '../../models/create-portfolio-payload.model';

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
    ],
    templateUrl: './acoes.component.html',
    styleUrls: ['./acoes.component.scss'],
})
export class AcoesComponent implements OnInit {
    portfolios = signal<PortfolioItem[]>([]);
    isLoading = signal(false);
    isDeleteMode = signal(false);
    isDeleting = signal(false);
    isCreating = signal(false);
    errorMessage = signal('');
    alerts = signal<AlertItem[]>([]);
    isDeleteModalOpen = signal(false);
    isCreateModalOpen = signal(false);
    portfolioToDelete = signal<PortfolioItem | null>(null);

    constructor(
        private readonly portfolioService: PortfolioService,
        private readonly router: Router,
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
                    this.portfolios.set(portfolioItems);
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

        this.portfolioService.deletePortfolio(portfolio.id).subscribe({
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
}