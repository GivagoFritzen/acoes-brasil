import { Injectable, signal } from '@angular/core';
import { Order } from '../models';

export interface ModalState {
  isDeleteModalOpen: boolean;
  isCreateModalOpen: boolean;
  orderToDelete: Order | null;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  readonly isDeleteModalOpen = signal(false);
  readonly isCreateModalOpen = signal(false);
  readonly orderToDelete = signal<Order | null>(null);

  openDeleteModal(order: Order): void {
    this.orderToDelete.set(order);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.orderToDelete.set(null);
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  closeAllModals(): void {
    this.closeDeleteModal();
    this.closeCreateModal();
  }

  getState(): ModalState {
    return {
      isDeleteModalOpen: this.isDeleteModalOpen(),
      isCreateModalOpen: this.isCreateModalOpen(),
      orderToDelete: this.orderToDelete()
    };
  }

  hasOpenModals(): boolean {
    return this.isDeleteModalOpen() || this.isCreateModalOpen();
  }
}
