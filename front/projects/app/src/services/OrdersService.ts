import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, OrdersResponse } from '../models';
import { CreateOrderPayload } from '../models/CreateOrderPayloadModel';
import { UpdateOrderPayload } from '../models/UpdateOrderPayloadModel';
import { ImportResponse } from '../models/ImportResponseModel';
import { ImportValidationResponse } from '../models/ImportValidationResponseModel';
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

  importOrdersSpreadsheet(file: File, confirmado: boolean = false): Observable<ImportResponse | ImportValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const url = confirmado ? `${this.baseUrl}/import?confirmado=true` : `${this.baseUrl}/import`;
    return this.http.post<ImportResponse | ImportValidationResponse>(url, formData).pipe(catchError(error => this.handleError(error)));
  }

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, payload).pipe(catchError(error => this.handleError(error)));
  }

  deleteOrder(id: string, confirmado: boolean = false): Observable<DeleteResponse | ImportValidationResponse> {
    const url = confirmado ? `${this.baseUrl}/${id}?confirmado=true` : `${this.baseUrl}/${id}`;
    return this.http.delete<DeleteResponse | ImportValidationResponse>(url).pipe(catchError(error => this.handleError(error)));
  }

  updateOrder(id: string, payload: UpdateOrderPayload): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}`, payload).pipe(catchError(error => this.handleError(error)));
  }

  exportSellSnapshotsSpreadsheet(ano?: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/sell-snapshots`, {
      responseType: 'blob',
      params: {
        ...(ano ? { ano } : {}),
      },
    }).pipe(catchError(error => this.handleError(error)));
  }

  getSellSnapshotsForPdf(ano?: string): Observable<SellSnapshotExportRow[]> {
    return this.http.get<SellSnapshotExportRow[]>(`${this.baseUrl}/export/sell-snapshots/data`, {
      params: {
        ...(ano ? { ano } : {}),
      },
    }).pipe(catchError(error => this.handleError(error)));
  }
}