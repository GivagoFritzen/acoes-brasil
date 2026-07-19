import { Component, computed, Input, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpTipComponent } from '../../../../components/help-tip/HelpTipComponent';
import { TranslatePipe } from '../../../../pipes/TranslatePipe';
import { TranslationService } from '../../../../services/TranslationService';
import { Investidor10AcaoDetails, Investidor10FiiDetails, Investidor10FiiIndicadorFundamentalista, Investidor10HistoricoIndicador, Investidor10ValorHistorico, Investidor10ValorPorPeriodo } from '../../../../models';

@Component({
    selector: 'app-investidor10-details',
    standalone: true,
    imports: [CommonModule, HelpTipComponent, TranslatePipe],
    templateUrl: './Investidor10DetailsComponent.html',
    styleUrls: ['./Investidor10DetailsComponent.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class Investidor10DetailsComponent {
    investidor10Value = signal<Investidor10AcaoDetails | Investidor10FiiDetails | null>(null);

    @Input() set investidor10(value: Investidor10AcaoDetails | Investidor10FiiDetails | null) {
        this.investidor10Value.set(value);
    }

    constructor(private readonly translationService: TranslationService) {}

    isFii = computed(() => {
        const inv = this.investidor10Value();
        if (!inv) return false;
        return 'imoveis' in inv;
    });

    imoveis = computed(() => {
        if (!this.isFii()) return [];
        return (this.investidor10Value() as Investidor10FiiDetails).imoveis ?? [];
    });

    informacoesFii = computed(() => {
        if (!this.isFii()) return [];
        return (this.investidor10Value() as Investidor10FiiDetails).informacoesFii ?? [];
    });

    investidor10FiiIndicadores = computed(() => {
        if (!this.isFii()) return [];
        return (this.investidor10Value() as Investidor10FiiDetails).indicadoresFundamentalistasFii ?? [];
    });

    periodosFiiIndicadores = computed(() => {
        const indicadores = this.investidor10FiiIndicadores();
        if (!indicadores.length) return [];
        return indicadores[0].valores.map((v) => v.periodo);
    });

    investidor10AcaoIndicadoresComHistorico = computed(() => {
        if (this.isFii()) return [];
        return (this.investidor10Value() as Investidor10AcaoDetails).indicadoresFundamentalistasComHistorico ?? [];
    });

    periodosAcaoIndicadoresComHistorico = computed(() => {
        const indicadores = this.investidor10AcaoIndicadoresComHistorico();
        if (!indicadores.length) return [];
        return indicadores[0].valores.map((v) => v.periodo);
    });

    acaoDetails = computed(() => {
        const inv = this.investidor10Value();
        if (!inv || this.isFii()) return null;
        return inv as Investidor10AcaoDetails;
    });

    historicoAnos = computed(() => {
        const inv = this.investidor10Value();
        if (!inv?.historicoIndicadores?.length) return [];
        const anos = new Set<number>();
        for (const item of inv.historicoIndicadores) {
            for (const valor of item.valores) {
                if (valor.ano !== null) anos.add(valor.ano);
            }
        }
        return Array.from(anos).sort((a, b) => b - a);
    });

    getValorHistorico(indicador: Investidor10HistoricoIndicador, ano: number): string {
        const valor = indicador.valores.find((v: Investidor10ValorHistorico) => v.ano === ano);
        if (!valor) return '-';
        const formatted = valor.valor.toFixed(2).replace('.', ',');
        return valor.tipo === 'percent' ? `${formatted}%` : formatted;
    }

    hasHelp(label: string): boolean {
        const key = this.normalize(label);
        return this.translationService.has(`indicators.${key}`);
    }

    getHelp(label: string): string {
        const key = this.normalize(label);
        return this.translationService.get(`indicators.${key}`);
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
}
