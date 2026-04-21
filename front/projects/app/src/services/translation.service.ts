import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private currentLang = signal<string>('pt-BR');
    private translations = signal<Record<string, any>>({});

    constructor(private readonly http: HttpClient) { }

    async loadLanguage(lang: string): Promise<void> {
        const url = `assets/i18n/${lang}.json`;

        try {
            const data = await firstValueFrom(
                this.http.get(url).pipe(
                    catchError(() => of({}))
                )
            );

            this.translations.set(data as Record<string, any>);
            this.currentLang.set(lang);
        } catch {
            this.translations.set({});
        }
    }

    get(key: string): string {
        const keys = key.split('.');
        let value = this.translations();

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return '';
            }
        }
        return typeof value === 'string' ? value : '';
    }

    has(key: string): boolean {
        return this.get(key) !== '';
    }
}