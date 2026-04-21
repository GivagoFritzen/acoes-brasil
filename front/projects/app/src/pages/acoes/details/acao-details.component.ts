import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { AlertsComponent } from '../../../alerts/alerts.component';
import {
    FundamentusAcaoDetails,
    FundamentusIndicator,
    ProventosResponse
} from '../../../models';
import { FundamentusService } from '../../../services/fundamentus.service';
import { ProventosService } from '../../../services/proventos.service';
import { HelpTipComponent } from '../../../components/help-tip/help-tip.component';
import { TranslationService } from '../../../services/translation.service';
import { AlertItem } from '../../../models/alert/alert-item.model';

@Component({
    selector: 'app-acao-details',
    standalone: true,
    imports: [CommonModule, RouterModule, AlertsComponent, HelpTipComponent],
    templateUrl: './acao-details.component.html',
    styleUrls: ['./acao-details.component.scss'],
})
export class AcaoDetailsComponent implements OnInit {

    fundamentus = signal<FundamentusAcaoDetails | null>(null);
    proventos = signal<ProventosResponse | null>(null);

    isLoading = signal(false);
    errorMessage = signal('');

    alerts = signal<AlertItem[]>([]);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly fundamentusService: FundamentusService,
        private readonly proventosService: ProventosService,
        private readonly translationService: TranslationService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const codigo = params.get('codigo');

            if (!codigo) {
                this.setError('Código do ativo não informado.');
                return;
            }

            this.loadAcaoDetails(codigo);
        });
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

    private normalize(label: string): string {
        return label
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[\/\s.()$]/g, '')
            .replace(/-/g, '')
            .replace(/%/g, '')
            .replace(/,/g, '')
            .replace(/:/g, '')
            .replace(/ /g, '');
    }

    hasHelp(label: string): boolean {
        const key = this.normalize(label);
        return this.translationService.has(`fundamentus.indicators.${key}`);
    }

    getHelp(label: string): string {
        const key = this.normalize(label);
        return this.translationService.get(`fundamentus.indicators.${key}`);
    }

    private loadAcaoDetails(codigo: string): void {
        const normalizedCode = codigo.trim().toUpperCase();

        this.isLoading.set(true);
        this.errorMessage.set('');
        this.alerts.set([]);

        this.fundamentus.set(null);
        this.proventos.set(null);

        forkJoin({
            fundamentus: this.fundamentusService
                .getAcaoDetails(normalizedCode)
                .pipe(catchError(() => of(null))),

            proventos: this.proventosService
                .getProventos({ codigo: normalizedCode, limit: 10 })
                .pipe(catchError(() => of(null))),
        })
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: ({ fundamentus, proventos }) => {
                    this.fundamentus.set(fundamentus);
                    this.proventos.set(proventos);

                    if (!fundamentus) {
                        this.pushAlert(
                            'warning',
                            'Atenção',
                            `Não foi possível carregar os dados do Fundamentus para ${normalizedCode}.`,
                            '!'
                        );
                    }

                    if (!proventos) {
                        this.pushAlert(
                            'warning',
                            'Atenção',
                            `Não foi possível carregar os proventos para ${normalizedCode}.`,
                            '!'
                        );
                    }
                },
                error: () => {
                    this.setError(`Não foi possível carregar os detalhes de ${normalizedCode}.`);
                }
            });
    }

    private setError(message: string): void {
        this.errorMessage.set(message);
        this.pushAlert('error', 'Erro', message, '✕');
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