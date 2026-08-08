import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpTipComponent } from '../../../../components/help-tip/HelpTipComponent';
import { TranslatePipe } from '../../../../pipes/TranslatePipe';
import { TranslationService } from '../../../../services/TranslationService';
import { FundamentusAcaoDetails } from '../../../../models';
import { normalizeLabel } from '../../../../utils/LabelUtils';

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
        const key = normalizeLabel(label);
        return this.translationService.has(`indicators.${key}`);
    }

    getHelp(label: string): string {
        const key = normalizeLabel(label);
        return this.translationService.get(`indicators.${key}`);
    }
}
