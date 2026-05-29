import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Provento, ProventosResponse } from '../models';
import { CreateProventoPayload } from '../models/CreateProventoPayloadModel';
import { ImportResponse } from '../models/ImportResponseModel';
import { DeleteResponse } from '../models/DeleteResponseModel';
import { getApiUrl } from '../config/ApiConfig';
import { BaseHttpService } from './BaseHttpService';

@Injectable({
  providedIn: 'root',
})
export class ProventosService extends BaseHttpService {
  private readonly baseUrl = getApiUrl('proventos');

  constructor(http: HttpClient) {
    super(http);
  }

  getProventos(params?: {
    codigo?: string;
    tipo?: string;
    data?: string;
    dataInicial?: string;
    dataFinal?: string;
    agruparPorCodigo?: boolean;
    page?: number;
    limit?: number;
  }): Observable<ProventosResponse> {
    return this.http.get<ProventosResponse>(this.baseUrl, {
      params: {
        ...(params?.codigo ? { codigo: params.codigo } : {}),
        ...(params?.tipo ? { tipo: params.tipo } : {}),
        ...(params?.data ? { data: params.data } : {}),
        ...(params?.dataInicial ? { dataInicial: params.dataInicial } : {}),
        ...(params?.dataFinal ? { dataFinal: params.dataFinal } : {}),
        ...(params?.agruparPorCodigo !== undefined ? { agruparPorCodigo: params.agruparPorCodigo } : {}),
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
      },
    }).pipe(catchError(error => this.handleError(error)));
  }

  importProventosSpreadsheet(file: File): Observable<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResponse>(`${this.baseUrl}/import`, formData).pipe(catchError(error => this.handleError(error)));
  }

  createProvento(payload: CreateProventoPayload): Observable<Provento> {
    return this.http.post<Provento>(this.baseUrl, payload).pipe(catchError(error => this.handleError(error)));
  }

  deleteProvento(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/${id}`).pipe(catchError(error => this.handleError(error)));
  }
}