import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketHoursService } from '../../services/market-hours.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe, LanguageSelectorComponent],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    showSidebar = true;
    isMarketOpen = false;

    constructor(private readonly marketHoursService: MarketHoursService) {}

    ngOnInit(): void {
        this.fetchMarketStatus();
    }

    toggleSidebar(): void {
        this.showSidebar = !this.showSidebar;
    }

    private fetchMarketStatus(): void {
        this.marketHoursService.getBvmfMarketHours().subscribe({
            next: (response) => {
                this.setMarketStatus(response.data.isOpen);
            },
            error: () => {
                this.setMarketStatus(false);
            },
        });
    }

    private setMarketStatus(isOpen: boolean): void {
        Promise.resolve().then(() => {
            this.isMarketOpen = isOpen;
        });
    }
}
