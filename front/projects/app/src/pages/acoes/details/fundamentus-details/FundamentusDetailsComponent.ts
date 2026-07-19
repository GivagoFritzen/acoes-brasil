import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpTipComponent } from '../../../../components/help-tip/HelpTipComponent';
import { TranslatePipe } from '../../../../pipes/TranslatePipe';
import { TranslationService } from '../../../../services/TranslationService';
import { FundamentusAcaoDetails } from '../../../../models';

@Component({
    selector: 'app-fundamentus-details',
    standalone: true,
    imports: [CommonModule, HelpTipComponent, TranslatePipe],
    templateUrl: './FundamentusDetailsComponent.html',
    encapsulation: ViewEncapsulation.None,
})
export class FundamentusDetailsComponent {
    @Input() fundamentus: FundamentusAcaoDetails | null = null;

    constructor(private readonly translationService: TranslationService) {}

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
