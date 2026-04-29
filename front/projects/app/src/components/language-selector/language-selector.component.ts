import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

export type Language = 'pt-BR' | 'en-US';

interface LanguageOption {
  code: Language;
  name: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);
  
  currentLanguage = signal<Language>('pt-BR');
  isDropdownOpen = signal(false);
  
  readonly languages: LanguageOption[] = [
    { code: 'pt-BR', name: 'Português' },
    { code: 'en-US', name: 'Inglês' }
  ];

  constructor() {
    // Obter idioma atual do serviço
    this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLanguage.set(lang as Language);
    });
  }

  async selectLanguage(language: Language): Promise<void> {
    if (language === this.currentLanguage()) {
      this.isDropdownOpen.set(false);
      return;
    }

    this.currentLanguage.set(language);
    await this.translationService.loadLanguage(language);
    this.isDropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  handleBlur(): void {
    // Pequeno delay para permitir clique nas opções antes de fechar
    setTimeout(() => {
      this.closeDropdown();
    }, 150);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  getCurrentLanguageOption(): LanguageOption {
    return this.languages.find(lang => lang.code === this.currentLanguage()) || this.languages[0];
  }
}
