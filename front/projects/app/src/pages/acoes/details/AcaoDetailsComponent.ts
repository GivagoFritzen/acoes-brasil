import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
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
import { HelpTipComponent } from '../../../components/help-tip/HelpTipComponent';
import { TranslatePipe } from '../../../pipes/TranslatePipe';
import { TranslationService } from '../../../services/TranslationService';
import { AlertItem } from '../../../models/alert/AlertItemModel';
import { FundamentusAcaoDetails, FundamentusIndicator, FundamentusProventosResponse, Investidor10AcaoDetails, Investidor10FiiDetails, Investidor10HistoricoIndicador, Investidor10ProventosResponse, Investidor10ValorHistorico, ProventosResponse, YahooFinanceDetails } from '../../../models';
import { CHART_WINDOWS, GoogleFinanceChartWindow, GoogleFinanceResponse } from '../../../../../../../common/models/google-finance';

@Component({
    selector: 'app-acao-details',
    standalone: true,
    imports: [CommonModule, RouterModule, AlertsComponent, SimpleButtonComponent, StockChartComponent, HelpTipComponent, TranslatePipe],
    templateUrl: './AcaoDetailsComponent.html',
    styleUrls: ['./AcaoDetailsComponent.scss'],
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
    historicoAnos = computed(() => {
        const inv = this.investidor10();
        if (!inv?.historicoIndicadores?.length) return [];
        const anos = new Set<number>();
        for (const item of inv.historicoIndicadores) {
            for (const valor of item.valores) {
                if (valor.ano !== null) anos.add(valor.ano);
            }
        }
        return Array.from(anos).sort((a, b) => b - a);
    });

    isFii = computed(() => {
        const inv = this.investidor10();
        if (!inv) return false;
        return 'imoveis' in inv;
    });

    imoveis = computed(() => {
        if (!this.isFii()) return [];
        return (this.investidor10() as Investidor10FiiDetails).imoveis ?? [];
    });

    informacoesFii = computed(() => {
        if (!this.isFii()) return [];
        return (this.investidor10() as Investidor10FiiDetails).informacoesFii ?? [];
    });

    acaoDetails = computed(() => {
        const inv = this.investidor10();
        if (!inv || this.isFii()) return null;
        return inv as Investidor10AcaoDetails;
    });

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

    getIndicator(fund: FundamentusAcaoDetails, label: string): string | null {
        const indicator = fund.indicadores.find(
            (item: FundamentusIndicator) => item.label === label
        );

        return indicator?.value ?? null;
    }

    hasHelp(label: string): boolean {
        const key = this.normalize(label);
        return this.translationService.has(`indicators.${key}`);
    }

    getHelp(label: string): string {
        const key = this.normalize(label);
        return this.translationService.get(`indicators.${key}`);
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

    private normalize(label: string): string {
        return label
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[\/\s.()$º]/g, '')
            .replace(/-/g, '')
            .replace(/%/g, '')
            .replace(/,/g, '')
            .replace(/:/g, '')
            .replace(/ /g, '');
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

    getValorHistorico(indicador: Investidor10HistoricoIndicador, ano: number): string {
        const valor = indicador.valores.find((v: Investidor10ValorHistorico) => v.ano === ano);
        if (!valor) return '-';
        const formatted = valor.valor.toFixed(2).replace('.', ',');
        return valor.tipo === 'percent' ? `${formatted}%` : formatted;
    }

    readonly incomeStatementFields = [
        { label: 'Receita', key: 'totalRevenue' },
        { label: 'Custo', key: 'costOfRevenue' },
        { label: 'Lucro Bruto', key: 'grossProfit' },
        { label: 'Resultado Operacional', key: 'operatingIncome' },
        { label: 'EBIT', key: 'ebit' },
        { label: 'Desp. Financeira', key: 'interestExpense' },
        { label: 'Lucro Antes IR', key: 'incomeBeforeTax' },
        { label: 'IR', key: 'incomeTaxExpense' },
        { label: 'Lucro Líquido', key: 'netIncome' },
    ];

    readonly balanceSheetFields = [
        { label: 'Ativo Total', key: 'totalAssets' },
        { label: 'Ativo Circulante', key: 'totalCurrentAssets' },
        { label: 'Caixa', key: 'cash' },
        { label: 'Passivo Total', key: 'totalLiabilities' },
        { label: 'Passivo Circulante', key: 'totalCurrentLiabilities' },
        { label: 'Dívida LP', key: 'longTermDebt' },
        { label: 'Dívida CP', key: 'shortLongTermDebt' },
        { label: 'Patrimônio Líquido', key: 'totalShareholderEquity' },
    ];

    readonly cashflowFields = [
        { label: 'Lucro Líquido', key: 'netIncome' },
        { label: 'Depreciação', key: 'depreciation' },
        { label: 'FCO', key: 'totalCashFromOperatingActivities' },
        { label: 'Capex', key: 'capitalExpenditures' },
        { label: 'FCI', key: 'totalCashFromInvestingActivities' },
        { label: 'Dividendos', key: 'dividendsPaid' },
        { label: 'FCF', key: 'totalCashFromFinancingActivities' },
    ];

    getFieldValue(item: object, key: string): string | null {
        return (item as Record<string, unknown>)?.[key] as string ?? null;
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