import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioItem } from '../models';
import { DeleteResponse } from '../models/delete-response.model';
import { CreatePortfolioPayload } from '../models/create-portfolio-payload.model';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private readonly baseUrl = 'http://localhost:3000/portfolios';

  constructor(private readonly http: HttpClient) { }

  getPortfolios(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(this.baseUrl);
  }

  createPortfolio(payload: CreatePortfolioPayload): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(this.baseUrl, payload);
  }

  deletePortfolio(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/${id}`);
  }
}