import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components';
import { TourComponent } from '../components/tour/TourComponent';
import { TourService } from '../services/TourService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TourComponent],
  templateUrl: './AppComponent.html',
  styleUrls: ['./AppComponent.scss'],
})
export class App implements OnInit {
  private readonly tourService = inject(TourService);

  ngOnInit(): void {
    if (!this.tourService.wasShown) {
      this.tourService.start();
    }
  }
}
