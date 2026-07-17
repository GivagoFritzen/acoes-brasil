import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { YahooFinanceDetails } from '../models';
import { getApiUrl } from '../config/ApiConfig';
import { BaseHttpService } from './BaseHttpService';

@Injectable({
  providedIn: 'root',
})
export class YahooFinanceService extends BaseHttpService {
  private readonly baseUrl = getApiUrl('yahooFinance');

  constructor(http: HttpClient) {
    super(http);
  }

  getAcaoDetails(codigo: string): Observable<YahooFinanceDetails> {
    const normalizedCode = codigo.trim().toUpperCase();
    return this.http.get<YahooFinanceDetails>(`${this.baseUrl}/${normalizedCode}`).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
