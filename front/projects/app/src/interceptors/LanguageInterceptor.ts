import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SettingsService } from '../services/SettingsService';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const settingsService = inject(SettingsService);
  const lang = settingsService.language();

  const clonedReq = req.clone({
    setHeaders: {
      'Accept-Language': lang
    }
  });

  return next(clonedReq);
};
