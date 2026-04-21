import { Injectable, signal } from '@angular/core';
import { OrderOperacao } from '../models';
import { OrdersFilters } from '../models/orders-filters.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersFilterService {
  readonly codigo = signal('');
  readonly operacao = signal<OrderOperacao | ''>('');
  readonly data = signal('');
  readonly dataFinal = signal('');

  readonly codigoAplicado = signal('');
  readonly operacaoAplicado = signal<OrderOperacao | ''>('');
  readonly dataAplicado = signal('');
  readonly dataFinalAplicado = signal('');

  updateCodigo(value: string): void {
    this.codigo.set(value);
  }

  updateOperacao(value: string): void {
    this.operacao.set(this.toOrderOperacao(value));
  }

  updateData(value: string): void {
    this.data.set(value);
  }

  updateDataFinal(value: string): void {
    this.dataFinal.set(value);
  }

  applyFilters(): OrdersFilters {
    this.setAppliedFiltersFromCurrent();
    return this.getAppliedFilters();
  }

  clearFilters(): void {
    this.resetCurrentFilters();
    this.resetAppliedFilters();
  }

  getAppliedFilters(): OrdersFilters {
    return {
      codigo: this.codigoAplicado(),
      operacao: this.operacaoAplicado(),
      dataInicial: this.dataAplicado(),
      dataFinal: this.dataFinalAplicado(),
    };
  }

  hasActiveFilters(): boolean {
    const filters = this.getAppliedFilters();
    return !!(filters.codigo || filters.operacao || filters.dataInicial || filters.dataFinal);
  }

  private setAppliedFiltersFromCurrent(): void {
    this.codigoAplicado.set(this.codigo());
    this.operacaoAplicado.set(this.operacao());
    this.dataAplicado.set(this.data());
    this.dataFinalAplicado.set(this.dataFinal());
  }

  private resetCurrentFilters(): void {
    this.codigo.set('');
    this.operacao.set('');
    this.data.set('');
    this.dataFinal.set('');
  }

  private resetAppliedFilters(): void {
    this.codigoAplicado.set('');
    this.operacaoAplicado.set('');
    this.dataAplicado.set('');
    this.dataFinalAplicado.set('');
  }

  private toOrderOperacao(value: string): OrderOperacao | '' {
    if (value === '') {
      return '';
    }

    const validOperations: OrderOperacao[] = ['Compra', 'Venda'];
    return validOperations.includes(value as OrderOperacao) ? value as OrderOperacao : '';
  }
}
