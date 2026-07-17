import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

export interface VisibleModules {
  wallet: boolean;
  composition: boolean;
  profitability: boolean;
}

const STORAGE_KEY_LANG = 'app_language';
const STORAGE_KEY_THEME = 'app_theme';
const STORAGE_KEY_MODULES = 'app_visible_modules';

const DEFAULT_VISIBLE_MODULES: VisibleModules = {
  wallet: true,
  composition: true,
  profitability: false,
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly theme = signal<Theme>('light');
  readonly language = signal<string>('pt-BR');
  readonly visibleModules = signal<VisibleModules>({ ...DEFAULT_VISIBLE_MODULES });

  constructor() {
    this.loadSettings();
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

  toggleModule(module: keyof VisibleModules): void {
    const updated = { ...this.visibleModules(), [module]: !this.visibleModules()[module] };
    this.visibleModules.set(updated);
    this.saveVisibleModules();
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

      const savedModules = localStorage.getItem(STORAGE_KEY_MODULES);
      if (savedModules) {
        const parsed = JSON.parse(savedModules);
        this.visibleModules.set({ ...DEFAULT_VISIBLE_MODULES, ...parsed });
      }
    } catch {
    }
  }

  private saveVisibleModules(): void {
    try {
      localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(this.visibleModules()));
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
