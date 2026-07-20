import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Router } from '@angular/router';
import { TourService } from './TourService';

const STORAGE_KEY = 'tour_was_shown';

describe('TourService', () => {
  let service: TourService;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };
    service = new TourService(routerMock as unknown as Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('inicialização', () => {
    it('deve iniciar com isActive false', () => {
      expect(service.isActive()).toBe(false);
    });

    it('deve iniciar com currentStepIndex 0', () => {
      expect(service.currentStepIndex()).toBe(0);
    });

    it('deve ter 20 steps definidos', () => {
      expect(service.totalSteps).toBe(20);
    });
  });

  describe('currentStep', () => {
    it('deve retornar step atual quando índice é válido', () => {
      expect(service.currentStep?.titleKey).toBe('tour.sidebarAcoesTitle');
    });

    it('deve retornar undefined quando não há steps', () => {
      expect(service.currentStep).toBeDefined();
    });

    it('deve atualizar quando currentStepIndex muda', () => {
      service.goToStep(1);
      expect(service.currentStep?.titleKey).toBe('tour.acoesTitle');
    });
  });

  describe('totalSteps', () => {
    it('deve retornar quantidade de steps', () => {
      expect(service.totalSteps).toBe(20);
    });

    it('deve ser igual ao length do array steps', () => {
      expect(service.totalSteps).toBe(service.steps().length);
    });
  });

  describe('isLastStep', () => {
    it('deve retornar true quando no último step', () => {
      service.goToStep(service.totalSteps - 1);
      expect(service.isLastStep).toBe(true);
    });

    it('deve retornar false quando não está no último step', () => {
      expect(service.isLastStep).toBe(false);
    });
  });

  describe('isFirstStep', () => {
    it('deve retornar true quando no primeiro step', () => {
      expect(service.isFirstStep).toBe(true);
    });

    it('deve retornar false quando não está no primeiro step', () => {
      service.goToStep(1);
      expect(service.isFirstStep).toBe(false);
    });
  });

  describe('wasShown', () => {
    it('deve retornar false quando localStorage não tem a chave', () => {
      expect(service.wasShown).toBe(false);
    });

    it('deve retornar true quando localStorage tem a chave como true', () => {
      localStorage.setItem(STORAGE_KEY, 'true');
      expect(service.wasShown).toBe(true);
    });

    it('deve retornar false quando localStorage tem a chave como false', () => {
      localStorage.setItem(STORAGE_KEY, 'false');
      expect(service.wasShown).toBe(false);
    });

    it('deve retornar false quando localStorage lança exceção', () => {
      const getItemOriginal = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => { throw new Error('erro'); });

      expect(service.wasShown).toBe(false);

      Storage.prototype.getItem = getItemOriginal;
    });
  });

  describe('start', () => {
    it('deve ativar o tour', () => {
      service.start();
      expect(service.isActive()).toBe(true);
    });

    it('deve resetar currentStepIndex para 0', () => {
      service.goToStep(3);
      service.start();
      expect(service.currentStepIndex()).toBe(0);
    });

    it('deve navegar para rota do primeiro step', () => {
      service.start();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/acoes']);
    });

    it('deve navegar apenas uma vez', () => {
      service.start();
      expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('next', () => {
    it('deve avançar para o próximo step', () => {
      service.start();
      service.next();
      expect(service.currentStepIndex()).toBe(1);
    });

    it('deve navegar para rota do próximo step', () => {
      service.start();
      service.next();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/acoes']);
    });

    it('não deve avançar além do último step', () => {
      service.goToStep(service.totalSteps - 1);
      service.next();
      expect(service.currentStepIndex()).toBe(service.totalSteps - 1);
    });

    it('não deve navegar quando já está no último step', () => {
      service.goToStep(service.totalSteps - 1);
      routerMock.navigate.mockClear();
      service.next();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('prev', () => {
    it('deve voltar para o step anterior', () => {
      service.goToStep(2);
      service.prev();
      expect(service.currentStepIndex()).toBe(1);
    });

    it('deve navegar para rota do step anterior', () => {
      service.goToStep(2);
      routerMock.navigate.mockClear();
      service.prev();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/acoes']);
    });

    it('não deve voltar antes do primeiro step', () => {
      service.prev();
      expect(service.currentStepIndex()).toBe(0);
    });

    it('não deve navegar quando já está no primeiro step', () => {
      routerMock.navigate.mockClear();
      service.prev();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('goToStep', () => {
    it('deve ir para o índice especificado', () => {
      service.goToStep(3);
      expect(service.currentStepIndex()).toBe(3);
    });

    it('deve navegar para rota do step', () => {
      service.goToStep(9);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/ordens']);
    });

    it('não deve ir para índice negativo', () => {
      service.goToStep(-1);
      expect(service.currentStepIndex()).toBe(0);
    });

    it('não deve ir para índice maior que total de steps', () => {
      service.goToStep(999);
      expect(service.currentStepIndex()).toBe(0);
    });

    it('não deve navegar quando índice é inválido', () => {
      routerMock.navigate.mockClear();
      service.goToStep(-1);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('deve desativar o tour', () => {
      service.start();
      service.finish();
      expect(service.isActive()).toBe(false);
    });

    it('deve resetar currentStepIndex para 0', () => {
      service.goToStep(3);
      service.finish();
      expect(service.currentStepIndex()).toBe(0);
    });

    it('deve salvar no localStorage que o tour foi mostrado', () => {
      service.finish();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('deve lidar com erro ao salvar no localStorage', () => {
      const setItemOriginal = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => { throw new Error('erro'); });

      expect(() => service.finish()).not.toThrow();

      Storage.prototype.setItem = setItemOriginal;
    });
  });

  describe('navegação entre rotas', () => {
    it('deve navegar para /acoes no step 0', () => {
      service.start();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/acoes']);
    });

    it('deve navegar para /acoes/teste no step 3', () => {
      service.goToStep(3);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/acoes/teste']);
    });

    it('deve navegar para /personalizar no step 7', () => {
      service.goToStep(7);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/personalizar']);
    });

    it('deve navegar para /ordens no step 9', () => {
      service.goToStep(9);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/ordens']);
    });

    it('deve navegar para /proventos no step 12', () => {
      service.goToStep(12);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/proventos']);
    });

    it('deve navegar para /importacao no step 14', () => {
      service.goToStep(14);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/importacao']);
    });

    it('deve navegar para /exportacao no step 16', () => {
      service.goToStep(16);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/exportacao']);
    });

    it('deve navegar para /configuracoes no step 18', () => {
      service.goToStep(18);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/configuracoes']);
    });
  });
});
