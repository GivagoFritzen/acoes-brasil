import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { DeleteConfirmationModalComponent } from '../../components/delete-confirmation-modal/DeleteConfirmationModalComponent';
import type { SelectOption } from '../../../../../../common/models/SelectOptionModel';
import { Order, OrderOperacao } from '../../models';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { CreateOrderPayload } from '../../models/CreateOrderPayloadModel';
import { UpdateOrderPayload } from '../../models/UpdateOrderPayloadModel';
import { formatDateForDisplay, compareIsoDates } from '../../utils/DateUtils';
import { normalizeOrderCodigo } from '../../../../../../common/utils/OrderCodigoUtils';
import { TranslatePipe } from '../../pipes/TranslatePipe';
import { TranslationService } from '../../services/TranslationService';
import { NotificationService } from '../../services/NotificationService';
import { OrdersStore } from './OrdersStore';

const SELL_OPERATION: OrderOperacao = 'Venda';

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
    TranslatePipe,
    DeleteConfirmationModalComponent,
  ],
  templateUrl: './OrdersComponent.html',
  styleUrls: ['./OrdersComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  private readonly ordersStore = inject(OrdersStore);
  private readonly notificationService = inject(NotificationService);
  private readonly translationService = inject(TranslationService);

  readonly formatDateForDisplay = formatDateForDisplay;

  readonly orders = this.ordersStore.orders;
  readonly isLoading = this.ordersStore.isLoading;
  readonly isDeleting = this.ordersStore.isDeleting;
  readonly isCreating = this.ordersStore.isCreating;
  readonly errorMessage = this.ordersStore.errorMessage;
  readonly page = this.ordersStore.page;
  readonly limit = this.ordersStore.limit;
  readonly totalPages = this.ordersStore.totalPages;
  readonly deleteDivergences = this.ordersStore.deleteDivergences;
  readonly alerts = this.notificationService.alerts;

  readonly isDeleteModalOpen = signal(false);
  readonly isCreateModalOpen = signal(false);
  readonly isEditModalOpen = signal(false);
  readonly isDeleteDivergenceModalOpen = signal(false);
  readonly orderToDelete = signal<Order | null>(null);
  readonly orderToEdit = signal<Order | null>(null);

  readonly operacaoOptions: SelectOption<OrderOperacao>[] = [
    { label: this.translationService.get('orders.filterBuy'), value: 'Compra' },
    { label: this.translationService.get('orders.filterSell'), value: 'Venda' },
  ];

  readonly filtroCodigo = signal('');
  readonly filtroOperacao = signal<OrderOperacao | ''>('');
  readonly filtroData = signal('');
  readonly filtroDataFinal = signal('');

  readonly filtroCodigoAplicado = computed(() => this.ordersStore.appliedFilters().codigo);
  readonly filtroOperacaoAplicado = computed(() => this.ordersStore.appliedFilters().operacao);
  readonly filtroDataAplicado = computed(() => this.ordersStore.appliedFilters().dataInicial);
  readonly filtroDataFinalAplicado = computed(() => this.ordersStore.appliedFilters().dataFinal);

  ngOnInit(): void {
    this.ordersStore.loadOrders();
  }

  handleFilterStartChange(value: string): void {
    this.filtroData.set(value);
    const dataFinalAtual = this.filtroDataFinal();
    if (value && dataFinalAtual && compareIsoDates(value, dataFinalAtual) > 0) {
      this.filtroDataFinal.set(value);
    }
  }

  handleFilterCodeChange(value: string): void {
    this.filtroCodigo.set(normalizeOrderCodigo(value));
  }

  handleFilterOperacaoChange(value: string): void {
    this.filtroOperacao.set(this.toOrderOperacao(value));
  }

  handleFilterEndChange(value: string): void {
    this.filtroDataFinal.set(value);
    const dataInicialAtual = this.filtroData();
    if (value && dataInicialAtual && compareIsoDates(value, dataInicialAtual) < 0) {
      this.filtroData.set(value);
    }
  }

  applyFilter(): void {
    this.ordersStore.setAppliedFilters({
      codigo: this.filtroCodigo(),
      operacao: this.filtroOperacao(),
      dataInicial: this.filtroData(),
      dataFinal: this.filtroDataFinal(),
    });
  }

  clearFilter(): void {
    this.filtroCodigo.set('');
    this.filtroOperacao.set('');
    this.filtroData.set('');
    this.filtroDataFinal.set('');
    this.ordersStore.clearFilters();
  }

  previousPage(): void {
    this.ordersStore.previousPage();
  }

  nextPage(): void {
    this.ordersStore.nextPage();
  }

  handleAlertDismiss(alert: AlertItem): void {
    this.notificationService.dismiss(alert);
  }

  getOrderClass(item: Order): string {
    return item.operacao === SELL_OPERATION ? 'orders__row--red' : '';
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
    if (this.isDeleting()) return;
    this.isDeleteModalOpen.set(false);
    this.orderToDelete.set(null);
  }

  closeCreateModal(): void {
    if (this.isCreating()) return;
    this.isCreateModalOpen.set(false);
  }

  openEditModal(order: Order): void {
    this.orderToEdit.set(order);
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    if (this.isCreating()) return;
    this.isEditModalOpen.set(false);
    this.orderToEdit.set(null);
  }

  confirmCreateOrder(payload: CreateOrderPayload): void {
    this.ordersStore.createOrder(payload, () => {
      this.isCreateModalOpen.set(false);
    });
  }

  confirmEditOrder(payload: UpdateOrderPayload): void {
    const order = this.orderToEdit();
    if (!order) return;

    this.ordersStore.updateOrder(order.id, payload, () => {
      this.isEditModalOpen.set(false);
      this.orderToEdit.set(null);
    });
  }

  confirmDeleteOrder(): void {
    const order = this.orderToDelete();
    if (!order) return;

    this.ordersStore.deleteOrder(order, false, {
      onSuccess: () => {
        this.isDeleteModalOpen.set(false);
        this.orderToDelete.set(null);
      },
      onDivergence: () => {
        this.isDeleteDivergenceModalOpen.set(true);
      },
      onError: () => {
        this.isDeleteModalOpen.set(false);
        this.orderToDelete.set(null);
      },
    });
  }

  confirmDeleteWithDivergence(): void {
    const order = this.orderToDelete();
    if (!order) return;

    this.ordersStore.deleteOrder(order, true, {
      onSuccess: () => {
        this.isDeleteDivergenceModalOpen.set(false);
        this.isDeleteModalOpen.set(false);
        this.orderToDelete.set(null);
      },
      onError: () => {
        this.isDeleteDivergenceModalOpen.set(false);
        this.isDeleteModalOpen.set(false);
        this.orderToDelete.set(null);
      },
    });
  }

  cancelDeleteDivergence(): void {
    this.isDeleteDivergenceModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.orderToDelete.set(null);
    this.ordersStore.deleteDivergences.set([]);
  }

  private toOrderOperacao(value: string): OrderOperacao | '' {
    if (value === '') return '';
    return this.isOrderOperacao(value) ? value : '';
  }

  private isOrderOperacao(value: string): value is OrderOperacao {
    return this.operacaoOptions.some((option) => option.value === value);
  }
}