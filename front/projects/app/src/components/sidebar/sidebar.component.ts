import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketHoursService } from '../../services/market-hours.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    showSidebar = true;
    isMarketOpen = false;

    constructor(private readonly marketHoursService: MarketHoursService) {}

    ngOnInit(): void {
        this.loadMarketStatus();
    }

    toggleSidebar(): void {
        this.showSidebar = !this.showSidebar;
    }

    private loadMarketStatus(): void {
        this.marketHoursService.getBvmfMarketHours().subscribe({
            next: (response) => {
                this.updateMarketStatus(response.data.isOpen);
            },
            error: () => {
                this.updateMarketStatus(false);
            },
        });
    }

    private updateMarketStatus(isOpen: boolean): void {
        Promise.resolve().then(() => {
            this.isMarketOpen = isOpen;
        });
    }
}
