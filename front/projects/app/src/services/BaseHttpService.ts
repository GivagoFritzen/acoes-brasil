import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import type { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseHttpService {
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
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
    
    switch (error.status) {
      case 400:
        return 'Requisição inválida.';
      case 401:
        return 'Não autorizado.';
      case 403:
        return 'Acesso negado.';
      case 404:
        return 'Recurso não encontrado.';
      case 500:
        return 'Erro interno do servidor.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }
}
