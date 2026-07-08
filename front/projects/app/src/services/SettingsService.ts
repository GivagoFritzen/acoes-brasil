import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY_LANG = 'app_language';
const STORAGE_KEY_THEME = 'app_theme';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly theme = signal<Theme>('light');
  readonly language = signal<string>('pt-BR');

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG);
      if (savedLang) {
        this.language.set(savedLang);
      }

      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
      if (savedTheme) {
        this.theme.set(savedTheme);
        this.applyTheme(savedTheme);
      }
    } catch {
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
    }
  }

  setLanguage(lang: string): void {
    this.language.set(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {
    }
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }
}
