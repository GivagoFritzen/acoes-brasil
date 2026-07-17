import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import type { VisibleModules } from '../../services/SettingsService';
import { SettingsService } from '../../services/SettingsService';

@Component({
    selector: 'app-customize',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslatePipe],
    templateUrl: './CustomizeComponent.html',
    styleUrls: ['./CustomizeComponent.scss'],
})
export class CustomizeComponent {
    protected readonly settingsService = inject(SettingsService);

    toggleModule(module: keyof VisibleModules): void {
        this.settingsService.toggleModule(module);
    }
}
