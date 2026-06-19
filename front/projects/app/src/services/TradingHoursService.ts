import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TradingHoursResponse } from '../models';
import { TradingHoursCalculator } from '../utils/TradingHoursCalculator';
import { getApiUrl } from '../config/ApiConfig';

@Injectable({
  providedIn: 'root',
})
export class TradingHoursService {
  private readonly defaultOpenTime = '10:00';
  private readonly defaultCloseTime = '16:55';
  private readonly defaultTradingDays = [1, 2, 3, 4, 5];
  private readonly defaultTimezone = 'America/Sao_Paulo';

  constructor(private readonly http: HttpClient) { }

  getBvmfTradingHours(): Observable<TradingHoursResponse> {
    return this.http.get<TradingHoursResponse>(getApiUrl('tradingHours')).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          isOpen: TradingHoursCalculator.calculate(
            response.data.openTime,
            response.data.closeTime,
            response.data.tradingDays,
            response.data.timezone,
            response.data.holidays,
          ),
        },
      })),
      catchError(() => of(this.buildFallbackResponse())),
    );
  }

  private buildFallbackResponse(): TradingHoursResponse {
    const isOpen = TradingHoursCalculator.calculate(
      this.defaultOpenTime,
      this.defaultCloseTime,
      this.defaultTradingDays,
      this.defaultTimezone,
      [],
    );

    return {
      success: false,
      data: {
        id: 'bvmf',
        name: 'B3',
        shortName: 'B3',
        country: 'BR',
        region: 'BR',
        timezone: this.defaultTimezone,
        currency: 'BRL',
        marketCap: '',
        location: 'São Paulo',
        website: '',
        openTime: this.defaultOpenTime,
        closeTime: this.defaultCloseTime,
        isOpen,
        holidays: [],
        tradingDays: this.defaultTradingDays,
        nextOpenTime: '',
        currentStatus: {
          marketId: 'bvmf',
          isOpen,
          status: isOpen ? 'open' : 'closed',
          nextChange: '',
          localTime: '',
          marketTime: '',
        },
        upcomingHolidays: [],
      },
    };
  }
}
