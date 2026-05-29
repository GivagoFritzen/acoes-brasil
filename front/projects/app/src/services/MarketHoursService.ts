import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarketHoursResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MarketHoursService {
  private readonly baseUrl = 'https://markethours.io/api/markets/bvmf';

  constructor(private readonly http: HttpClient) { }

  getBvmfMarketHours(): Observable<MarketHoursResponse> {
    return this.http.get<MarketHoursResponse>(this.baseUrl);
  }
}