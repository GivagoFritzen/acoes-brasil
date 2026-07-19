import { Component, Input, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpTipComponent } from '../../../../components/help-tip/HelpTipComponent';
import { TranslatePipe } from '../../../../pipes/TranslatePipe';
import { TranslationService } from '../../../../services/TranslationService';
import { YahooFinanceDetails } from '../../../../models';

@Component({
    selector: 'app-yahoo-finance-details',
    standalone: true,
    imports: [CommonModule, HelpTipComponent, TranslatePipe],
    templateUrl: './YahooFinanceDetailsComponent.html',
    styleUrls: ['./YahooFinanceDetailsComponent.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class YahooFinanceDetailsComponent {
    yahooFinanceValue = signal<YahooFinanceDetails | null>(null);

    @Input() set yahooFinance(value: YahooFinanceDetails | null) {
        this.yahooFinanceValue.set(value);
    }

    constructor(private readonly translationService: TranslationService) {}

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
