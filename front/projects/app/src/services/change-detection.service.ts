import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangeDetectionService {
  private changeDetection$ = new Subject<void>();

  get changeDetection() {
    return this.changeDetection$.asObservable();
  }

  triggerChangeDetection(): void {
    this.changeDetection$.next();
  }
}
