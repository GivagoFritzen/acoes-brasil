import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FundamentusAcaoDetails } from '../models';
import { getApiUrl } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class FundamentusService {
  private readonly baseUrl = getApiUrl('fundamentus');

  constructor(private readonly http: HttpClient) {}

  getAcaoDetails(codigo: string): Observable<FundamentusAcaoDetails> {
    const normalizedCode = codigo.trim().toUpperCase();
    return this.http.get<FundamentusAcaoDetails>(`${this.baseUrl}/${normalizedCode}`);
  }
}
