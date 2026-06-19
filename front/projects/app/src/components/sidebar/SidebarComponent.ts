import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TradingHoursService } from '../../services/TradingHoursService';
import { TourService } from '../../services/TourService';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { LanguageSelectorComponent } from '../language-selector/LanguageSelectorComponent';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe, LanguageSelectorComponent],
    templateUrl: './SidebarComponent.html',
    styleUrls: ['./SidebarComponent.scss'],
})
export class SidebarComponent implements OnInit {
    showSidebar = true;
    isMarketOpen = false;

    constructor(
        private readonly tradingHoursService: TradingHoursService,
        readonly tourService: TourService,
    ) {
        effect(() => {
            if (this.tourService.isActive()) {
                this.showSidebar = false;
            }
        });
    }

    ngOnInit(): void {
        this.fetchMarketStatus();
    }

    toggleSidebar(): void {
        this.showSidebar = !this.showSidebar;
    }

    private fetchMarketStatus(): void {
        this.tradingHoursService.getBvmfTradingHours().subscribe({
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
