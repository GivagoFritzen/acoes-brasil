import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import type { ApiError } from '../models/ApiError';
import { TranslationService } from './TranslationService';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseHttpService {
  private readonly translationService = inject(TranslationService);

  protected constructor(protected readonly http: HttpClient) {}

  protected handleError(error: HttpErrorResponse): Observable<never> {
    const apiError: ApiError = {
      message: this.getErrorMessage(error),
      status: error.status,
      error: error.error
    };

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.status === 0) {
      return this.translationService.get('common.errors.connection');
    }
    
    switch (error.status) {
      case 400:
        return this.translationService.get('common.errors.badRequest');
      case 401:
        return this.translationService.get('common.errors.unauthorized');
      case 403:
        return this.translationService.get('common.errors.forbidden');
      case 404:
        return this.translationService.get('common.errors.notFound');
      case 500:
        return this.translationService.get('common.errors.internalServer');
      default:
        return this.translationService.get('common.errors.unexpected');
    }
  }
}
