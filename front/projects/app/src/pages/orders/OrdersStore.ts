import { Injectable, inject, signal } from '@angular/core';
import { Order, OrdersResponse } from '../../models';
import { OrdersFilters } from '../../models/OrdersFiltersModel';
import { CreateOrderPayload } from '../../models/CreateOrderPayloadModel';
import { UpdateOrderPayload } from '../../models/UpdateOrderPayloadModel';
import { ImportDivergence } from '../../models/ImportDivergenceModel';
import { OrdersService } from '../../services/OrdersService';
import { NotificationService } from '../../services/NotificationService';
import { TranslationService } from '../../services/TranslationService';
import { finalize } from 'rxjs';

const DEFAULT_LIMIT = 10;

@Injectable({
  providedIn: 'root',
})
export class OrdersStore {
  private readonly ordersService = inject(OrdersService);
  private readonly notificationService = inject(NotificationService);
  private readonly translationService = inject(TranslationService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly isCreating = signal(false);
  readonly errorMessage = signal('');
  readonly page = signal(1);
  readonly limit = signal(DEFAULT_LIMIT);
  readonly totalPages = signal(1);
  readonly deleteDivergences = signal<ImportDivergence[]>([]);

  readonly appliedFilters = signal<OrdersFilters>({
    codigo: '',
    operacao: '',
    dataInicial: '',
    dataFinal: '',
  });

  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.notificationService.clear();
    const filters = this.appliedFilters();

    this.ordersService
      .getOrders({
        codigo: filters.codigo || undefined,
        operacao: filters.operacao || undefined,
        dataInicial: filters.dataInicial || undefined,
        dataFinal: filters.dataFinal || undefined,
        page: this.page(),
        limit: this.limit(),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: OrdersResponse) => {
          this.orders.set(response.data ?? []);
          this.page.set(response.page);
          this.limit.set(response.limit);
          this.totalPages.set(response.totalPages);
        },
        error: () => {
          const msg = this.translationService.get('orders.alerts.loadFailed');
          this.errorMessage.set(msg);
          this.notificationService.error(msg, this.translationService.get('common.alerts.error'));
        },
      });
  }

  setAppliedFilters(filters: OrdersFilters): void {
    this.appliedFilters.set(filters);
    this.page.set(1);
    this.loadOrders();
  }

  clearFilters(): void {
    this.appliedFilters.set({
      codigo: '',
      operacao: '',
      dataInicial: '',
      dataFinal: '',
    });
    this.page.set(1);
    this.loadOrders();
  }

  previousPage(): void {
    if (this.page() <= 1) return;
    this.page.update((p) => p - 1);
    this.loadOrders();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) return;
    this.page.update((p) => p + 1);
    this.loadOrders();
  }

  createOrder(payload: CreateOrderPayload, onComplete?: () => void): void {
    this.isCreating.set(true);

    this.ordersService
      .createOrder(payload)
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
          onComplete?.();
        })
      )
      .subscribe({
        next: (order: Order) => {
          this.notificationService.success(
            `${this.translationService.get('orders.alerts.orderCreated')} ${order.codigo}`,
            this.translationService.get('common.alerts.success')
          );
          this.loadOrders();
        },
        error: () => {
          this.notificationService.error(
            this.translationService.get('orders.alerts.createFailed'),
            this.translationService.get('common.alerts.error')
          );
        },
      });
  }

  updateOrder(id: string, payload: UpdateOrderPayload, onComplete?: () => void): void {
    this.isCreating.set(true);

    this.ordersService
      .updateOrder(id, payload)
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
          onComplete?.();
        })
      )
      .subscribe({
        next: (updated: Order) => {
          this.notificationService.success(
            `${this.translationService.get('orders.alerts.orderUpdated')} ${updated.codigo}`,
            this.translationService.get('common.alerts.success')
          );
          this.loadOrders();
        },
        error: () => {
          this.notificationService.error(
            this.translationService.get('orders.alerts.createFailed'),
            this.translationService.get('common.alerts.error')
          );
        },
      });
  }

  deleteOrder(
    order: Order,
    confirmado = false,
    callbacks?: {
      onSuccess?: () => void;
      onDivergence?: (divergences: ImportDivergence[]) => void;
      onError?: () => void;
    }
  ): void {
    this.isDeleting.set(true);

    const delete$ = confirmado
      ? this.ordersService.deleteOrder(order.id, true)
      : this.ordersService.deleteOrder(order.id);

    delete$
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: (response) => {
          if ('divergencias' in response && response.divergencias.length > 0) {
            this.deleteDivergences.set(response.divergencias);
            callbacks?.onDivergence?.(response.divergencias);
          } else {
            this.deleteDivergences.set([]);
            this.notificationService.success(
              `${this.translationService.get('orders.alerts.orderDeleted')} ${order.codigo}`,
              this.translationService.get('common.alerts.success')
            );
            callbacks?.onSuccess?.();
            this.loadOrders();
          }
        },
        error: () => {
          this.notificationService.error(
            this.translationService.get('orders.alerts.deleteFailed'),
            this.translationService.get('common.alerts.error')
          );
          callbacks?.onError?.();
        },
      });
  }
}
