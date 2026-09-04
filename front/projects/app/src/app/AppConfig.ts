import { ApplicationConfig, provideAppInitializer, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './AppRoutes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslationService } from '../services/TranslationService';
import { SettingsService } from '../services/SettingsService';
import { languageInterceptor } from '../interceptors/LanguageInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([languageInterceptor])),
    provideAppInitializer(() => {
      const translationService = inject(TranslationService);
      const settingsService = inject(SettingsService);

      const lang = settingsService.language();

      return translationService.loadLanguage(lang);
    })
  ]
};