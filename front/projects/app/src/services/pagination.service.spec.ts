import { describe, it, expect, beforeEach } from 'vitest';
import { PaginationService } from './pagination.service';

describe('PaginationService', () => {
  let service: PaginationService;

  beforeEach(() => {
    service = new PaginationService();
  });

  describe('inicialização', () => {
    it('deve iniciar com estado padrão', () => {
      expect(service.getState()).toEqual({ page: 1, limit: 10, totalPages: 1 });
    });

    it('deve iniciar sinais com valores padrão', () => {
      expect(service.page()).toBe(1);
      expect(service.limit()).toBe(10);
      expect(service.totalPages()).toBe(1);
    });
  });

  describe('updatePage', () => {
    it('deve atualizar página quando dentro do intervalo', () => {
      service.updateTotalPages(5);
      service.updatePage(3);
      expect(service.page()).toBe(3);
    });

    it('não deve atualizar página quando menor que 1', () => {
      service.updateTotalPages(5);
      service.updatePage(0);
      expect(service.page()).toBe(1);
    });

    it('não deve atualizar página quando maior que totalPages', () => {
      service.updateTotalPages(5);
      service.updatePage(6);
      expect(service.page()).toBe(1);
    });

    it('deve manter página inalterada se totalPages for 0', () => {
      service.updateTotalPages(0);
      service.updatePage(1);
      expect(service.page()).toBe(1);
    });
  });

  describe('updateLimit', () => {
    it('deve atualizar limite e resetar página para 1', () => {
      service.updateTotalPages(5);
      service.updatePage(3);
      service.updateLimit(25);
      expect(service.limit()).toBe(25);
      expect(service.page()).toBe(1);
    });

    it('não deve atualizar limite quando zero ou negativo', () => {
      service.updateLimit(0);
      expect(service.limit()).toBe(10);
      service.updateLimit(-5);
      expect(service.limit()).toBe(10);
    });

    it('deve resetar página para 1 mesmo se página atual for 1', () => {
      service.updateLimit(50);
      expect(service.page()).toBe(1);
    });
  });

  describe('updateTotalPages', () => {
    it('deve atualizar totalPages', () => {
      service.updateTotalPages(10);
      expect(service.totalPages()).toBe(10);
    });

    it('deve ajustar página atual se for maior que novo totalPages', () => {
      service.updateTotalPages(5);
      service.updatePage(5);
      service.updateTotalPages(3);
      expect(service.page()).toBe(3);
    });

    it('não deve ajustar página se totalPages for zero', () => {
      service.updateTotalPages(0);
      expect(service.totalPages()).toBe(0);
    });

    it('deve aceitar totalPages zero', () => {
      service.updateTotalPages(0);
      expect(service.totalPages()).toBe(0);
    });
  });

  describe('nextPage', () => {
    it('deve avançar para próxima página quando possível', () => {
      service.updateTotalPages(3);
      expect(service.nextPage()).toBe(true);
      expect(service.page()).toBe(2);
    });

    it('não deve avançar se já estiver na última página', () => {
      service.updateTotalPages(1);
      expect(service.nextPage()).toBe(false);
      expect(service.page()).toBe(1);
    });

    it('deve retornar false se totalPages for zero', () => {
      service.updateTotalPages(0);
      expect(service.nextPage()).toBe(false);
    });
  });

  describe('previousPage', () => {
    it('deve voltar para página anterior quando possível', () => {
      service.updateTotalPages(3);
      service.updatePage(2);
      expect(service.previousPage()).toBe(true);
      expect(service.page()).toBe(1);
    });

    it('não deve voltar se já estiver na primeira página', () => {
      service.updatePage(1);
      expect(service.previousPage()).toBe(false);
      expect(service.page()).toBe(1);
    });
  });

  describe('canGoNext', () => {
    it('deve retornar true quando página atual menor que totalPages', () => {
      service.updateTotalPages(3);
      expect(service.canGoNext()).toBe(true);
    });

    it('deve retornar false quando página atual igual a totalPages', () => {
      service.updateTotalPages(1);
      expect(service.canGoNext()).toBe(false);
    });

    it('deve retornar false quando totalPages for zero', () => {
      service.updateTotalPages(0);
      expect(service.canGoNext()).toBe(false);
    });
  });

  describe('canGoPrevious', () => {
    it('deve retornar true quando página atual maior que 1', () => {
      service.updateTotalPages(3);
      service.updatePage(2);
      expect(service.canGoPrevious()).toBe(true);
    });

    it('deve retornar false quando página atual for 1', () => {
      expect(service.canGoPrevious()).toBe(false);
    });
  });

  describe('reset', () => {
    it('deve resetar para valores padrão', () => {
      service.updateTotalPages(5);
      service.updatePage(3);
      service.updateLimit(50);
      service.reset();
      expect(service.page()).toBe(1);
      expect(service.limit()).toBe(10);
      expect(service.totalPages()).toBe(1);
    });

    it('deve resetar mesmo se estado já for padrão', () => {
      service.reset();
      expect(service.getState()).toEqual({ page: 1, limit: 10, totalPages: 1 });
    });
  });

  describe('getState', () => {
    it('deve retornar estado atual', () => {
      service.updateTotalPages(5);
      service.updatePage(3);
      service.updateLimit(20);
      // updateLimit reseta page para 1
      expect(service.getState()).toEqual({ page: 1, limit: 20, totalPages: 5 });
    });

    it('deve refletir mudanças após atualizações', () => {
      const state1 = service.getState();
      service.updateTotalPages(5);
      service.updatePage(3);
      const state2 = service.getState();
      expect(state1.page).toBe(1);
      expect(state2.page).toBe(3);
    });
  });

  describe('sinais', () => {
    it('page deve refletir mudanças quando totalPages permite', () => {
      expect(service.page()).toBe(1);
      service.updateTotalPages(5);
      service.updatePage(2);
      expect(service.page()).toBe(2);
    });

    it('limit deve refletir mudanças', () => {
      expect(service.limit()).toBe(10);
      service.updateLimit(30);
      expect(service.limit()).toBe(30);
    });

    it('totalPages deve refletir mudanças', () => {
      expect(service.totalPages()).toBe(1);
      service.updateTotalPages(8);
      expect(service.totalPages()).toBe(8);
    });
  });
});
