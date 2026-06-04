import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getApiUrl } from '../config/ApiConfig';
import { BaseHttpService } from './BaseHttpService';
import { GoogleFinanceChartWindow, GoogleFinanceResponse } from '../../../../../common/models/google-finance';

@Injectable({
  providedIn: 'root',
})
export class GoogleFinanceService extends BaseHttpService {
  private readonly baseUrl = getApiUrl('googleFinance');

  constructor(http: HttpClient) {
    super(http);
  }

  getData(codigo: string, chartWindow: GoogleFinanceChartWindow = '1Y'): Observable<GoogleFinanceResponse> {
    const normalizedCode = codigo.trim().toUpperCase();
    const params = new HttpParams().set('window', chartWindow);
    return this.http.get<GoogleFinanceResponse>(`${this.baseUrl}/${normalizedCode}`, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
