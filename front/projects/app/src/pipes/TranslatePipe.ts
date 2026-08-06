import { Pipe, PipeTransform, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../services/TranslationService';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private lastKey: string = '';
  private lastValue: string = '';

  constructor() {
    this.translationService.currentLang$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  transform(key: string): string {
    this.lastKey = key;
    const currentValue = this.translationService.get(key) || key;
    
    if (currentValue !== this.lastValue) {
      this.lastValue = currentValue;
    }
    
    return currentValue;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
