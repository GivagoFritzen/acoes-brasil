import { ChangeDetectionStrategy, Component, computed, Input, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpTipComponent } from '../../../../components/help-tip/HelpTipComponent';
import { TranslatePipe } from '../../../../pipes/TranslatePipe';
import { TranslationService } from '../../../../services/TranslationService';
import { Investidor10AcaoDetails, Investidor10FiiDetails, Investidor10HistoricoIndicador, Investidor10ValorHistorico } from '../../../../models';
import { normalizeLabel } from '../../../../utils/LabelUtils';

@Component({
    selector: 'app-investidor10-details',
    standalone: true,
    imports: [CommonModule, HelpTipComponent, TranslatePipe],
    templateUrl: './Investidor10DetailsComponent.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Investidor10DetailsComponent {
    investidor10Value = signal<Investidor10AcaoDetails | Investidor10FiiDetails | null>(null);

    @Input() set investidor10(value: Investidor10AcaoDetails | Investidor10FiiDetails | null) {
        this.investidor10Value.set(value);
    }

    constructor(private readonly translationService: TranslationService) { }

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

    receitaAtual = computed(() => {
        const acao = this.acaoDetails();
        if (!acao?.receitas?.length) return null;
        return acao.receitas[0];
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
        const key = normalizeLabel(label);
        return this.translationService.has(`indicators.${key}`);
    }

    getHelp(label: string): string {
        const key = normalizeLabel(label);
        return this.translationService.get(`indicators.${key}`);
    }
}
