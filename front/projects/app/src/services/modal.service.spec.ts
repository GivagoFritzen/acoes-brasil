import { describe, it, expect, beforeEach } from 'vitest';
import { ModalService } from './modal.service';
import { Order } from '../models';

describe('ModalService', () => {
  let service: ModalService;
  const mockOrder: Order = { id: '1', codigo: 'PETR4' } as Order;

  beforeEach(() => {
    service = new ModalService();
  });

  describe('openCreateModal', () => {
    it('deve abrir modal de criação', () => {
      service.openCreateModal();
      expect(service.isCreateModalOpen()).toBe(true);
    });

    it('deve manter isDeleteModalOpen inalterado ao abrir create', () => {
      service.openDeleteModal(mockOrder);
      service.openCreateModal();

      expect(service.isCreateModalOpen()).toBe(true);
      expect(service.isDeleteModalOpen()).toBe(true);
    });
  });

  describe('closeCreateModal', () => {
    it('deve fechar modal de criação', () => {
      service.openCreateModal();
      expect(service.isCreateModalOpen()).toBe(true);

      service.closeCreateModal();
      expect(service.isCreateModalOpen()).toBe(false);
    });

    it('deve manter isDeleteModalOpen inalterado ao fechar create', () => {
      service.openDeleteModal(mockOrder);
      service.closeCreateModal();

      expect(service.isCreateModalOpen()).toBe(false);
      expect(service.isDeleteModalOpen()).toBe(true);
    });
  });

  describe('openDeleteModal', () => {
    it('deve abrir modal de exclusão e definir orderToDelete', () => {
      service.openDeleteModal(mockOrder);

      expect(service.isDeleteModalOpen()).toBe(true);
      expect(service.orderToDelete()).toEqual(mockOrder);
    });

    it('deve manter isCreateModalOpen inalterado ao abrir delete', () => {
      service.openCreateModal();
      service.openDeleteModal(mockOrder);

      expect(service.isCreateModalOpen()).toBe(true);
      expect(service.isDeleteModalOpen()).toBe(true);
    });
  });

  describe('closeDeleteModal', () => {
    it('deve fechar modal de exclusão e limpar orderToDelete', () => {
      service.openDeleteModal(mockOrder);
      expect(service.isDeleteModalOpen()).toBe(true);

      service.closeDeleteModal();

      expect(service.isDeleteModalOpen()).toBe(false);
      expect(service.orderToDelete()).toBeNull();
    });

    it('deve manter isCreateModalOpen inalterado ao fechar delete', () => {
      service.openCreateModal();
      service.closeDeleteModal();

      expect(service.isCreateModalOpen()).toBe(true);
      expect(service.isDeleteModalOpen()).toBe(false);
    });
  });

  describe('closeAllModals', () => {
    it('deve fechar todos os modais', () => {
      service.openCreateModal();
      service.openDeleteModal(mockOrder);

      service.closeAllModals();

      expect(service.isCreateModalOpen()).toBe(false);
      expect(service.isDeleteModalOpen()).toBe(false);
      expect(service.orderToDelete()).toBeNull();
    });

    it('deve funcionar quando nenhum modal está aberto', () => {
      service.closeAllModals();

      expect(service.hasOpenModals()).toBe(false);
    });

    it('deve limpar orderToDelete ao fechar todos', () => {
      service.openDeleteModal(mockOrder);
      service.closeAllModals();

      expect(service.orderToDelete()).toBeNull();
    });
  });

  describe('hasOpenModals', () => {
    it('deve retornar true quando modal de criação está aberto', () => {
      service.openCreateModal();
      expect(service.hasOpenModals()).toBe(true);
    });

    it('deve retornar true quando modal de exclusão está aberto', () => {
      service.openDeleteModal(mockOrder);
      expect(service.hasOpenModals()).toBe(true);
    });

    it('deve retornar false quando nenhum modal está aberto', () => {
      expect(service.hasOpenModals()).toBe(false);
    });

    it('deve retornar true quando ambos estão abertos', () => {
      service.openCreateModal();
      service.openDeleteModal(mockOrder);
      expect(service.hasOpenModals()).toBe(true);
    });
  });

  describe('getState', () => {
    it('deve retornar estado inicial quando nenhum modal aberto', () => {
      const state = service.getState();

      expect(state).toEqual({
        isDeleteModalOpen: false,
        isCreateModalOpen: false,
        orderToDelete: null,
      });
    });

    it('deve retornar estado correto com modal de criação aberto', () => {
      service.openCreateModal();
      const state = service.getState();

      expect(state.isCreateModalOpen).toBe(true);
      expect(state.isDeleteModalOpen).toBe(false);
    });

    it('deve retornar estado correto com modal de exclusão aberto', () => {
      service.openDeleteModal(mockOrder);
      const state = service.getState();

      expect(state.isDeleteModalOpen).toBe(true);
      expect(state.orderToDelete).toEqual(mockOrder);
    });

    it('deve retornar estado com ambos modais abertos', () => {
      service.openCreateModal();
      service.openDeleteModal(mockOrder);
      const state = service.getState();

      expect(state.isCreateModalOpen).toBe(true);
      expect(state.isDeleteModalOpen).toBe(true);
      expect(state.orderToDelete).toEqual(mockOrder);
    });
  });

  describe('signals', () => {
    it('isCreateModalOpen deve refletir mudanças', () => {
      expect(service.isCreateModalOpen()).toBe(false);

      service.openCreateModal();
      expect(service.isCreateModalOpen()).toBe(true);

      service.closeCreateModal();
      expect(service.isCreateModalOpen()).toBe(false);
    });

    it('isDeleteModalOpen deve refletir mudanças', () => {
      expect(service.isDeleteModalOpen()).toBe(false);

      service.openDeleteModal(mockOrder);
      expect(service.isDeleteModalOpen()).toBe(true);

      service.closeDeleteModal();
      expect(service.isDeleteModalOpen()).toBe(false);
    });

    it('orderToDelete deve refletir mudanças', () => {
      expect(service.orderToDelete()).toBeNull();

      service.openDeleteModal(mockOrder);
      expect(service.orderToDelete()).toEqual(mockOrder);

      service.closeDeleteModal();
      expect(service.orderToDelete()).toBeNull();
    });
  });
});
