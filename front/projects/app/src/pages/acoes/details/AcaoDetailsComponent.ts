import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';
import { AlertsComponent } from '../../../components/alerts/AlertsComponent';
import { SimpleButtonComponent } from '../../../components/simple-button/SimpleButtonComponent';
import { StockChartComponent } from '../../../components/stock-chart/StockChartComponent';
import { FundamentusService } from '../../../services/FundamentusService';
import { Investidor10Service } from '../../../services/Investidor10Service';
import { YahooFinanceService } from '../../../services/YahooFinanceService';
import { GoogleFinanceService } from '../../../services/GoogleFinanceService';
import { ProventosService } from '../../../services/ProventosService';
import { TranslatePipe } from '../../../pipes/TranslatePipe';
import { TranslationService } from '../../../services/TranslationService';
import { AlertItem } from '../../../models/alert/AlertItemModel';
import { FundamentusAcaoDetails, FundamentusProventosResponse, Investidor10AcaoDetails, Investidor10FiiDetails, Investidor10ProventosResponse, ProventosResponse, YahooFinanceDetails } from '../../../models';
import { CHART_WINDOWS, GoogleFinanceChartWindow, GoogleFinanceResponse } from '../../../../../../../common/models/google-finance';
import { FundamentusDetailsComponent } from './fundamentus-details/FundamentusDetailsComponent';
import { Investidor10DetailsComponent } from './investidor10-details/Investidor10DetailsComponent';
import { YahooFinanceDetailsComponent } from './yahoo-finance-details/YahooFinanceDetailsComponent';

@Component({
    selector: 'app-acao-details',
    standalone: true,
    imports: [CommonModule, RouterModule, AlertsComponent, SimpleButtonComponent, StockChartComponent, TranslatePipe, FundamentusDetailsComponent, Investidor10DetailsComponent, YahooFinanceDetailsComponent],
    templateUrl: './AcaoDetailsComponent.html',
    styleUrls: ['./AcaoDetailsComponent.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AcaoDetailsComponent implements OnInit {

    fundamentus = signal<FundamentusAcaoDetails | null>(null);
    investidor10 = signal<Investidor10AcaoDetails | Investidor10FiiDetails | null>(null);
    yahooFinance = signal<YahooFinanceDetails | null>(null);
    proventos = signal<ProventosResponse | null>(null);
    fundamentusProventos = signal<FundamentusProventosResponse | null>(null);
    investidor10Proventos = signal<Investidor10ProventosResponse | null>(null);
    selectedSourceProventos = computed(() => {
        if (this.detailSource() === 'fundamentus') {
            return this.fundamentusProventos();
        }
        if (this.detailSource() === 'investidor10') {
            return this.investidor10Proventos();
        }
        return null;
    });
    googleFinance = signal<GoogleFinanceResponse | null>(null);
    chartWindows = CHART_WINDOWS;
    selectedChartWindow = signal<GoogleFinanceChartWindow>('1Y');

    isLoading = signal(false);
    errorMessage = signal('');

    alerts = signal<AlertItem[]>([]);

    private readonly STORAGE_KEY = 'app_acao_details_source';

    isPersonalizarOpen = signal(false);
    detailOptions = ['fundamentus', 'investidor10', 'yahoo'] as const;
    detailSource = signal<'fundamentus' | 'investidor10' | 'yahoo'>(this.loadSavedSource());

    constructor(
        private readonly route: ActivatedRoute,
        private readonly fundamentusService: FundamentusService,
        private readonly investidor10Service: Investidor10Service,
        private readonly yahooFinanceService: YahooFinanceService,
        private readonly googleFinanceService: GoogleFinanceService,
        private readonly proventosService: ProventosService,
        private readonly translationService: TranslationService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const codigo = params.get('codigo');

            if (!codigo) {
                this.setError(this.translationService.get('acaoDetails.errors.codeNotProvided'));
                return;
            }

            this.loadAcaoDetails(codigo);
        });
    }

    openPersonalizar(): void {
        this.isPersonalizarOpen.set(true);
    }

    closePersonalizar(): void {
        this.isPersonalizarOpen.set(false);
    }

    selectDetailSource(source: 'fundamentus' | 'investidor10' | 'yahoo'): void {
        if (this.detailSource() === source) {
            this.isPersonalizarOpen.set(false);
            return;
        }

        this.detailSource.set(source);
        this.persistSource(source);

        this.isPersonalizarOpen.set(false);

        const codigo = this.route.snapshot.paramMap.get('codigo');
        if (codigo) {
            this.loadAcaoDetails(codigo);
        }
    }

    private loadSavedSource(): 'fundamentus' | 'investidor10' | 'yahoo' {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved === 'fundamentus' || saved === 'investidor10' || saved === 'yahoo') {
                return saved;
            }
        } catch {
        }
        return 'fundamentus';
    }

    private persistSource(source: 'fundamentus' | 'investidor10' | 'yahoo'): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, source);
        } catch {
        }
    }

    handleAlertDismiss(alert: AlertItem): void {
        this.alerts.update(items =>
            items.filter(item =>
                item.variant !== alert.variant ||
                item.title !== alert.title ||
                item.message !== alert.message ||
                item.icon !== alert.icon
            )
        );
    }

    changeChartWindow(window: GoogleFinanceChartWindow): void {
        this.selectedChartWindow.set(window);

        const codigo = this.route.snapshot.paramMap.get('codigo');
        if (!codigo) return;

        this.googleFinanceService.getData(codigo, window).subscribe({
            next: (data) => this.googleFinance.set(data),
            error: () => {
                this.pushAlert(
                    'warning',
                    this.translationService.get('acaoDetails.errors.attention'),
                    `${this.translationService.get('acaoDetails.errors.googleFinanceLoadFailed')} ${codigo}.`,
                    '!'
                );
            }
        });
    }

    private loadAcaoDetails(codigo: string): void {
        const normalizedCode = codigo.trim().toUpperCase();
        const source = this.detailSource();

        this.isLoading.set(true);
        this.errorMessage.set('');
        this.alerts.set([]);

        this.fundamentus.set(null);
        this.investidor10.set(null);
        this.yahooFinance.set(null);
        this.proventos.set(null);
        this.fundamentusProventos.set(null);
        this.investidor10Proventos.set(null);
        this.googleFinance.set(null);

        const observables: Record<string, Observable<unknown>> = {
            googleFinance: this.googleFinanceService
                .getData(normalizedCode)
                .pipe(catchError(() => of(null))),
        };

        if (source === 'investidor10') {
            observables['investidor10'] = this.investidor10Service
                .getAcaoDetails(normalizedCode)
                .pipe(catchError(() => of(null)));

            observables['investidor10Proventos'] = this.investidor10Service
                .getProventos(normalizedCode)
                .pipe(catchError(() => of(null)));
        } else if (source === 'yahoo') {
            observables['yahooFinance'] = this.yahooFinanceService
                .getAcaoDetails(normalizedCode)
                .pipe(catchError(() => of(null)));
        } else {
            observables['fundamentus'] = this.fundamentusService
                .getAcaoDetails(normalizedCode)
                .pipe(catchError(() => of(null)));

            observables['fundamentusProventos'] = this.fundamentusService
                .getProventos(normalizedCode)
                .pipe(catchError(() => of(null)));
        }

        forkJoin(observables)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (result) => {
                    if (source === 'investidor10') {
                        this.investidor10.set(result['investidor10'] as Investidor10AcaoDetails ?? null);
                        this.investidor10Proventos.set(result['investidor10Proventos'] as Investidor10ProventosResponse ?? null);
                        if (!result['investidor10']) {
                            this.pushAlert(
                                'warning',
                                this.translationService.get('acaoDetails.errors.attention'),
                                `${this.translationService.get('acaoDetails.errors.investidor10LoadFailed')} ${normalizedCode}.`,
                                '!'
                            );
                        }
                    } else if (source === 'yahoo') {
                        this.yahooFinance.set(result['yahooFinance'] as YahooFinanceDetails ?? null);
                        if (!result['yahooFinance']) {
                            this.pushAlert(
                                'warning',
                                this.translationService.get('acaoDetails.errors.attention'),
                                `${this.translationService.get('acaoDetails.errors.yahooFinanceLoadFailed')} ${normalizedCode}.`,
                                '!'
                            );
                        }
                    } else {
                        this.fundamentus.set(result['fundamentus'] as FundamentusAcaoDetails ?? null);
                        this.fundamentusProventos.set(result['fundamentusProventos'] as FundamentusProventosResponse ?? null);
                        if (!result['fundamentus']) {
                            this.pushAlert(
                                'warning',
                                this.translationService.get('acaoDetails.errors.attention'),
                                `${this.translationService.get('acaoDetails.errors.fundamentusLoadFailed')} ${normalizedCode}.`,
                                '!'
                            );
                        }
                    }

                    this.googleFinance.set(result['googleFinance'] as GoogleFinanceResponse ?? null);

                    if (source === 'fundamentus' && !result['fundamentusProventos']) {
                        this.pushAlert(
                            'warning',
                            this.translationService.get('acaoDetails.errors.attention'),
                            `${this.translationService.get('acaoDetails.errors.proventosLoadFailed')} ${normalizedCode}.`,
                            '!'
                        );
                    }
                    if (source === 'investidor10' && !result['investidor10Proventos']) {
                        this.pushAlert(
                            'warning',
                            this.translationService.get('acaoDetails.errors.attention'),
                            `${this.translationService.get('acaoDetails.errors.investidor10LoadFailed')} ${normalizedCode}.`,
                            '!'
                        );
                    }
                },
                error: () => {
                    this.setError(`${this.translationService.get('acaoDetails.errors.detailsLoadFailed')} ${normalizedCode}.`);
                }
            });
    }

    private setError(message: string): void {
        this.errorMessage.set(message);
        this.pushAlert('error', this.translationService.get('acaoDetails.errors.error'), message, '✕');
    }

    private pushAlert(
        variant: AlertItem['variant'],
        title: string,
        message: string,
        icon: string
    ): void {
        this.alerts.update(items => [{ variant, title, message, icon }, ...items]);
    }
}