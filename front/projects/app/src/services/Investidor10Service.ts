import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Investidor10AcaoDetails, Investidor10ProventosResponse } from '../models';
import { getApiUrl } from '../config/ApiConfig';
import { BaseHttpService } from './BaseHttpService';

@Injectable({
  providedIn: 'root',
})
export class Investidor10Service extends BaseHttpService {
  private readonly baseUrl = getApiUrl('investidor10');

  constructor(http: HttpClient) {
    super(http);
  }

  getAcaoDetails(codigo: string): Observable<Investidor10AcaoDetails> {
    const normalizedCode = codigo.trim().toUpperCase();
    return this.http.get<Investidor10AcaoDetails>(`${this.baseUrl}/${normalizedCode}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getProventos(codigo: string): Observable<Investidor10ProventosResponse> {
    const normalizedCode = codigo.trim().toUpperCase();
    return this.http.get<Investidor10ProventosResponse>(`${this.baseUrl}/${normalizedCode}/proventos`).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
