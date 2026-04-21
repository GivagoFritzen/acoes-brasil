import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PortfolioItem } from '../models';
import { DeleteResponse } from '../models/delete-response.model';
import { CreatePortfolioPayload } from '../models/create-portfolio-payload.model';
import { getApiUrl } from '../config/api.config';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService extends BaseHttpService {
  private readonly baseUrl = getApiUrl('portfolios');

  constructor(http: HttpClient) {
    super(http);
  }

  getPortfolios(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(this.baseUrl).pipe(
      catchError(error => this.handleError(error))
    );
  }

  createPortfolio(payload: CreatePortfolioPayload): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(this.baseUrl, payload).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deletePortfolio(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => this.handleError(error))
    );
  }
}