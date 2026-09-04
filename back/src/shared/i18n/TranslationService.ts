import ptBR from './pt-BR.json';
import enUS from './en-US.json';

type TranslationKeys = typeof ptBR;

const translations: Record<string, TranslationKeys> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

const DEFAULT_LANG = 'pt-BR';

function getSupportedLanguage(lang: string | undefined): string {
  if (!lang) return DEFAULT_LANG;
  if (translations[lang]) {
    return lang;
  }
  const langPrefix = lang.split('-')[0];
  const supportedKey = Object.keys(translations).find(key => key.startsWith(langPrefix));
  return supportedKey || DEFAULT_LANG;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? String(params[paramKey]) : match;
  });
}

export const translationService = {
  translate(key: string, lang?: string, params?: Record<string, string | number>): string {
    return this.translateForKey(key, lang ?? DEFAULT_LANG, params);
  },

  translateForKey(key: string, lang: string, params?: Record<string, string | number>): string {
    const supportedLang = getSupportedLanguage(lang);
    const translationsForLang = translations[supportedLang];

    if (!translationsForLang) {
      return key;
    }

    const keys = key.split('.');
    let value: unknown = translationsForLang;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return interpolate(value, params);
    }

    return value;
  }
};
