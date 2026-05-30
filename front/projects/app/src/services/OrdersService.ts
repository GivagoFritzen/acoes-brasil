import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, OrdersResponse } from '../models';
import { CreateOrderPayload } from '../models/CreateOrderPayloadModel';
import { ImportResponse } from '../models/ImportResponseModel';
import { SellSnapshotExportRow } from '../models/SellSnapshotExportRowModel';
import { DeleteResponse } from '../models/DeleteResponseModel';
import { getApiUrl } from '../config/ApiConfig';
import { BaseHttpService } from './BaseHttpService';

@Injectable({
  providedIn: 'root',
})
export class OrdersService extends BaseHttpService {
  private readonly baseUrl = getApiUrl('orders');

  constructor(http: HttpClient) {
    super(http);
  }

  getOrders(params?: {
    codigo?: string;
    operacao?: string;
    data?: string;
    dataInicial?: string;
    dataFinal?: string;
    page?: number;
    limit?: number;
  }): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(this.baseUrl, {
      params: {
        ...(params?.codigo ? { codigo: params.codigo } : {}),
        ...(params?.operacao ? { operacao: params.operacao } : {}),
        ...(params?.data ? { data: params.data } : {}),
        ...(params?.dataInicial ? { dataInicial: params.dataInicial } : {}),
        ...(params?.dataFinal ? { dataFinal: params.dataFinal } : {}),
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
      },
    }).pipe(catchError(error => this.handleError(error)));
  }

  importOrdersSpreadsheet(file: File): Observable<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResponse>(`${this.baseUrl}/import`, formData).pipe(catchError(error => this.handleError(error)));
  }

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, payload).pipe(catchError(error => this.handleError(error)));
  }

  deleteOrder(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/${id}`).pipe(catchError(error => this.handleError(error)));
  }

  exportSellSnapshotsSpreadsheet(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/sell-snapshots`, {
      responseType: 'blob',
    }).pipe(catchError(error => this.handleError(error)));
  }

  getSellSnapshotsForPdf(): Observable<SellSnapshotExportRow[]> {
    return this.http.get<SellSnapshotExportRow[]>(`${this.baseUrl}/export/sell-snapshots/data`).pipe(catchError(error => this.handleError(error)));
  }
}