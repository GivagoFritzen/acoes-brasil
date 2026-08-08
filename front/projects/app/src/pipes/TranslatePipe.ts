import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/TranslationService';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: string): string {
    void this.translationService.getCurrentLanguage();
    return this.translationService.get(key) || key;
  }
}
