import { Request, Response, NextFunction } from 'express';
import { translationService } from './TranslationService';

declare global {
  namespace Express {
    interface Request {
      language: string;
      t: (key: string, params?: Record<string, string | number>) => string;
    }
  }
}

export const languageMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const acceptLanguage = req.headers['accept-language'] || 'pt-BR';
  const lang = acceptLanguage.split(',')[0].trim();

  req.language = lang;
  req.t = (key: string, params?: Record<string, string | number>) => {
    return translationService.translate(key, lang, params);
  };

  next();
};
