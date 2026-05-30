import { Pipe, PipeTransform, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../services/TranslationService';
import { ChangeDetectionService } from '../services/ChangeDetectionService';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translationService = inject(TranslationService);
  private changeDetectionService = inject(ChangeDetectionService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private lastKey: string = '';
  private lastValue: string = '';

  transform(key: string): string {
    // Primeira vez que a key é usada, inscreve para mudanças
    if (key !== this.lastKey) {
      this.lastKey = key;
      
      // Inscreve para mudanças de idioma
      this.changeDetectionService.changeDetection
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          // Força o change detection quando o idioma muda
          this.cdr.markForCheck();
        });
    }
    
    const currentValue = this.translationService.get(key) || key;
    
    // Se o valor mudou, atualiza
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
