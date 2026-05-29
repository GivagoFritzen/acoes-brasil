import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AlertsComponent } from '../../components/alerts/AlertsComponent';
import {
  AddOrderModalComponent,
  ActionButtonComponent,
  DatePickerComponent,
  PaginationComponent,
  SimpleButtonComponent,
  SimpleInputComponent,
  SimpleSelectComponent,
} from '../../components';
import type { SelectOption } from '../../../../../../common/models/SelectOptionModel';
import { Order, OrderOperacao, OrdersResponse } from '../../models';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { CreateOrderPayload } from '../../models/CreateOrderPayloadModel';
import { OrdersService } from '../../services/OrdersService';
import { formatDateForDisplay } from '../../utils/DateUtils';
import { OrdersFilters } from '../../models/OrdersFiltersModel';
import { normalizeOrderCodigo } from '../../../../../../common/utils/OrderCodigoUtils';
import { TranslatePipe } from '../../pipes/TranslatePipe';

const DEFAULT_LIMIT = 10;
const SELL_OPERATION: OrderOperacao = 'Venda';
const LOAD_ORDERS_ERROR_MESSAGE = 'Não foi possível carregar as ordens.';
const CREATE_ORDER_ERROR_MESSAGE = 'Não foi possível adicionar a ordem.';
const DELETE_ORDER_ERROR_MESSAGE = 'Não foi possível deletar a ordem.';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    AlertsComponent,
    AddOrderModalComponent,
    ActionButtonComponent,
    PaginationComponent,
    DatePickerComponent,
    SimpleInputComponent,
    SimpleSelectComponent,
    SimpleButtonComponent,
    TranslatePipe
  ],
  templateUrl: './OrdersComponent.html',
  styleUrls: ['./OrdersComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);

  readonly formatDateForDisplay = formatDateForDisplay;
  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly isCreating = signal(false);
  readonly errorMessage = signal('');
  readonly alerts = signal<AlertItem[]>([]);
  readonly isDeleteModalOpen = signal(false);
  readonly isCreateModalOpen = signal(false);
  readonly orderToDelete = signal<Order | null>(null);

  readonly operacaoOptions: SelectOption<OrderOperacao>[] = [
    { label: 'Compra', value: 'Compra' },
    { label: 'Venda', value: 'Venda' },
  ];

  readonly filtroCodigo = signal('');
  readonly filtroOperacao = signal<OrderOperacao | ''>('');
  readonly filtroData = signal('');
  readonly filtroDataFinal = signal('');

  readonly filtroCodigoAplicado = signal('');
  readonly filtroOperacaoAplicado = signal<OrderOperacao | ''>('');
  readonly filtroDataAplicado = signal('');
  readonly filtroDataFinalAplicado = signal('');

  readonly page = signal(1);
  readonly limit = signal(DEFAULT_LIMIT);
  readonly totalPages = signal(1);

  ngOnInit(): void {
    this.loadOrders();
  }

  handleFilterStartChange(value: string): void {
    this.filtroData.set(value);
  }

  handleFilterCodeChange(value: string): void {
    this.filtroCodigo.set(normalizeOrderCodigo(value));
  }

  handleFilterOperacaoChange(value: string): void {
    this.filtroOperacao.set(this.toOrderOperacao(value));
  }

  handleFilterEndChange(value: string): void {
    this.filtroDataFinal.set(value);
  }

  applyFilter(): void {
    this.setAppliedFiltersFromCurrent();
    this.page.set(1);
    this.loadOrders();
  }

  clearFilter(): void {
    this.resetCurrentFilters();
    this.resetAppliedFilters();
    this.page.set(1);
    this.loadOrders();
  }

  previousPage(): void {
    if (this.page() <= 1) {
      return;
    }

    this.page.set(this.page() - 1);
    this.loadOrders();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) {
      return;
    }

    this.page.set(this.page() + 1);
    this.loadOrders();
  }

  handleAlertDismiss(alert: AlertItem): void {
    this.alerts.update((items: AlertItem[]) =>
      items.filter(
        (item: AlertItem) =>
          item.variant !== alert.variant ||
          item.title !== alert.title ||
          item.message !== alert.message ||
          item.icon !== alert.icon,
      ),
    );
  }

  getOrderClass(item: Order): string {
    if (item.operacao === SELL_OPERATION) {
      return 'orders__row--red';
    }

    return '';
  }

  trackByOrderId(_: number, item: Order): string {
    return item.id;
  }

  openDeleteModal(order: Order): void {
    this.orderToDelete.set(order);
    this.isDeleteModalOpen.set(true);
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) {
      return;
    }

    this.isDeleteModalOpen.set(false);
    this.orderToDelete.set(null);
  }

  closeCreateModal(): void {
    if (this.isCreating()) {
      return;
    }

    this.isCreateModalOpen.set(false);
  }

  confirmCreateOrder(payload: CreateOrderPayload): void {
    this.isCreating.set(true);

    this.ordersService
      .createOrder(payload)
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
          this.isCreateModalOpen.set(false);
        }),
      )
      .subscribe({
        next: (order: Order) => {
          this.alerts.set([
            {
              variant: 'info',
              title: 'Sucesso',
              message: `Ordem ${order.codigo} adicionada com sucesso.`,
              icon: '✓',
            },
          ]);
          this.loadOrders();
        },
        error: () => {
          this.alerts.set([this.createErrorAlert(CREATE_ORDER_ERROR_MESSAGE)]);
        },
      });
  }

  confirmDeleteOrder(): void {
    const order = this.orderToDelete();
    if (!order) {
      return;
    }

    this.isDeleting.set(true);

    this.ordersService
      .deleteOrder(order.id)
      .pipe(
        finalize(() => {
          this.isDeleting.set(false);
          this.isDeleteModalOpen.set(false);
          this.orderToDelete.set(null);
        }),
      )
      .subscribe({
        next: () => {
          this.alerts.set([
            {
              variant: 'info',
              title: 'Sucesso',
              message: `Ordem ${order.codigo} removida com sucesso.`,
              icon: '✓',
            },
          ]);
          this.loadOrders();
        },
        error: () => {
          this.alerts.set([this.createErrorAlert(DELETE_ORDER_ERROR_MESSAGE)]);
        },
      });
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.alerts.set([]);
    const appliedFilters = this.getAppliedFilters();

    this.ordersService
      .getOrders({
        codigo: appliedFilters.codigo || undefined,
        operacao: appliedFilters.operacao || undefined,
        dataInicial: appliedFilters.dataInicial || undefined,
        dataFinal: appliedFilters.dataFinal || undefined,
        page: this.page(),
        limit: this.limit(),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: OrdersResponse) => this.applyListResponse(response),
        error: () => {
          this.errorMessage.set(LOAD_ORDERS_ERROR_MESSAGE);
          this.alerts.set([this.createErrorAlert(LOAD_ORDERS_ERROR_MESSAGE)]);
        },
      });
  }

  private getAppliedFilters(): OrdersFilters {
    return {
      codigo: this.filtroCodigoAplicado(),
      operacao: this.filtroOperacaoAplicado(),
      dataInicial: this.filtroDataAplicado(),
      dataFinal: this.filtroDataFinalAplicado(),
    };
  }

  private setAppliedFiltersFromCurrent(): void {
    this.filtroCodigoAplicado.set(this.filtroCodigo());
    this.filtroOperacaoAplicado.set(this.filtroOperacao());
    this.filtroDataAplicado.set(this.filtroData());
    this.filtroDataFinalAplicado.set(this.filtroDataFinal());
  }

  private resetCurrentFilters(): void {
    this.filtroCodigo.set('');
    this.filtroOperacao.set('');
    this.filtroData.set('');
    this.filtroDataFinal.set('');
  }

  private resetAppliedFilters(): void {
    this.filtroCodigoAplicado.set('');
    this.filtroOperacaoAplicado.set('');
    this.filtroDataAplicado.set('');
    this.filtroDataFinalAplicado.set('');
  }

  private toOrderOperacao(value: string): OrderOperacao | '' {
    if (value === '') {
      return '';
    }

    return this.isOrderOperacao(value) ? value : '';
  }

  private isOrderOperacao(value: string): value is OrderOperacao {
    return this.operacaoOptions.some((option) => option.value === value);
  }

  private applyListResponse(response: OrdersResponse): void {
    this.orders.set(response.data ?? []);
    this.page.set(response.page);
    this.limit.set(response.limit);
    this.totalPages.set(response.totalPages);
  }

  private createErrorAlert(message: string): AlertItem {
    return {
      variant: 'error',
      title: 'Error!',
      message,
      icon: '✕',
    };
  }
}