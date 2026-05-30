import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FundamentusAcaoDetails } from '../models';
import { getApiUrl } from '../config/ApiConfig';
import { BaseHttpService } from './BaseHttpService';

@Injectable({
  providedIn: 'root',
})
export class FundamentusService extends BaseHttpService {
  private readonly baseUrl = getApiUrl('fundamentus');

  constructor(http: HttpClient) {
    super(http);
  }

  getAcaoDetails(codigo: string): Observable<FundamentusAcaoDetails> {
    const normalizedCode = codigo.trim().toUpperCase();
    return this.http.get<FundamentusAcaoDetails>(`${this.baseUrl}/${normalizedCode}`).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
