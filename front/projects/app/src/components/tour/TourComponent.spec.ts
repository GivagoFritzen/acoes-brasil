import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { TourComponent } from './TourComponent';
import { TourService } from '../../services/TourService';
import { Router } from '@angular/router';

describe('TourComponent', () => {
  let component: TourComponent;
  let tourService: TourService;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });
    vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});

    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [TourComponent],
      providers: [
        TourService,
        { provide: Router, useValue: routerMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    const fixture = TestBed.createComponent(TourComponent);
    component = fixture.componentInstance;
    tourService = TestBed.inject(TourService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('inicialização', () => {
    it('deve criar componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve iniciar com state null', () => {
      expect(component.state()).toBeNull();
    });
  });

  describe('titleKey e descKey', () => {
    it('deve retornar titleKey do step atual', () => {
      tourService.start();
      expect(component.titleKey).toBe('tour.sidebarAcoesTitle');
    });

    it('deve retornar descKey do step atual', () => {
      tourService.start();
      expect(component.descKey).toBe('tour.sidebarAcoesDesc');
    });

    it('deve retornar string vazia quando tour esta inativo e step atual é undefined', () => {
      tourService.steps.set([]);
      expect(component.titleKey).toBe('');
      expect(component.descKey).toBe('');
    });
  });

  describe('ngOnDestroy', () => {
    it('deve chamar stopPoll no destroy', () => {
      const spy = vi.spyOn(component as any, 'stopPoll');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });

    it('deve chamar detachListeners no destroy', () => {
      const spy = vi.spyOn(component as any, 'detachListeners');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('reposition - lógica de posicionamento', () => {
    it('deve posicionar card à direita do elemento quando há espaço (position padrão right)', () => {
      const elMock = {
        getBoundingClientRect: () => ({ top: 100, left: 300, width: 200, height: 40, right: 500, bottom: 140 }),
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(elMock as any);

      tourService.start();
      (component as any).reposition();

      const state = component.state();
      expect(state).not.toBeNull();
      expect(state!.spotlight).toEqual({ top: 100, left: 300, width: 200, height: 40 });
      expect(state!.placement).toBe('right');
    });

    it('deve posicionar card acima do elemento quando não há espaço abaixo', () => {
      Object.defineProperty(window, 'innerHeight', { value: 400, writable: true, configurable: true });
      const elMock = {
        getBoundingClientRect: () => ({ top: 300, left: 100, width: 200, height: 40, right: 300, bottom: 340 }),
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(elMock as any);

      tourService.steps.set([{
        route: '/test',
        titleKey: 'test',
        descKey: 'test',
        elementSelector: '[data-tour="test"]',
        position: 'top',
      }]);
      tourService.currentStepIndex.set(0);
      tourService.isActive.set(true);

      (component as any).reposition();

      const state = component.state();
      expect(state).not.toBeNull();
      expect(state!.placement).toBe('top');
    });

    it('deve posicionar card à esquerda quando position é left', () => {
      const elMock = {
        getBoundingClientRect: () => ({ top: 200, left: 500, width: 200, height: 40, right: 700, bottom: 240 }),
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(elMock as any);

      tourService.steps.set([{
        route: '/test',
        titleKey: 'test',
        descKey: 'test',
        elementSelector: '[data-tour="test"]',
        position: 'left',
      }]);
      tourService.currentStepIndex.set(0);
      tourService.isActive.set(true);

      (component as any).reposition();

      const state = component.state();
      expect(state).not.toBeNull();
      expect(state!.placement).toBe('left');
    });

    it('deve posicionar card à direita quando position é right', () => {
      const elMock = {
        getBoundingClientRect: () => ({ top: 200, left: 50, width: 200, height: 40, right: 250, bottom: 240 }),
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(elMock as any);

      tourService.steps.set([{
        route: '/test',
        titleKey: 'test',
        descKey: 'test',
        elementSelector: '[data-tour="test"]',
        position: 'right',
      }]);
      tourService.currentStepIndex.set(0);
      tourService.isActive.set(true);

      (component as any).reposition();

      const state = component.state();
      expect(state).not.toBeNull();
      expect(state!.placement).toBe('right');
    });

    it('deve usar fallback center quando position é center', () => {
      const elMock = {
        getBoundingClientRect: () => ({ top: 100, left: 100, width: 200, height: 40, right: 300, bottom: 140 }),
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(elMock as any);

      tourService.steps.set([{
        route: '/test',
        titleKey: 'test',
        descKey: 'test',
        elementSelector: '[data-tour="test"]',
        position: 'center',
      }]);
      tourService.currentStepIndex.set(0);
      tourService.isActive.set(true);

      (component as any).reposition();

      const state = component.state();
      expect(state).not.toBeNull();
      expect(state!.placement).toBe('bottom');
    });

    it('deve usar fallback quando nenhuma posição cabe na tela', () => {
      Object.defineProperty(window, 'innerWidth', { value: 350, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 300, writable: true, configurable: true });
      const elMock = {
        getBoundingClientRect: () => ({ top: 50, left: 50, width: 200, height: 40, right: 250, bottom: 90 }),
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(elMock as any);

      tourService.start();
      (component as any).reposition();

      const state = component.state();
      expect(state).not.toBeNull();
      expect(state!.card.top).toBeGreaterThanOrEqual(0);
      expect(state!.card.left).toBeGreaterThanOrEqual(0);
    });

    it('deve posicionar no centro quando viewport é pequena (mobile)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400, writable: true, configurable: true });
      const elMock = {
        getBoundingClientRect: () => ({ top: 100, left: 50, width: 200, height: 40, right: 250, bottom: 140 }),
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(elMock as any);

      tourService.start();
      (component as any).reposition();

      const state = component.state();
      expect(state).not.toBeNull();
      expect(state!.placement).toBe('center');
      expect(state!.card).toEqual({ top: 0, left: 0 });
    });

    it('deve parar poll quando elemento não é encontrado', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      tourService.start();
      (component as any).reposition();

      expect(component.state()).toBeNull();
    });

    it('deve setar state null e parar poll quando step não tem elementSelector', () => {
      tourService.steps.set([{
        route: '/test',
        titleKey: 'test',
        descKey: 'test',
      }]);
      tourService.currentStepIndex.set(0);
      tourService.isActive.set(true);

      (component as any).reposition();

      expect(component.state()).toBeNull();
    });

    it('deve parar poll quando tour não está ativo', () => {
      tourService.isActive.set(false);

      (component as any).reposition();

      expect(component.state()).toBeNull();
    });
  });

  describe('poll e listeners', () => {
    it('deve iniciar poll quando startPoll é chamado diretamente', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      (component as any).startPoll();
      expect((component as any).pollId).not.toBeNull();
    });

    it('deve parar poll quando stopPoll é chamado', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      (component as any).startPoll();
      (component as any).stopPoll();
      expect((component as any).pollId).toBeNull();
    });

    it('deve limitar pollAttempts ao máximo', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);
      tourService.start();

      for (let i = 0; i < 101; i++) {
        (component as any).reposition();
      }

      expect((component as any).pollAttempts).toBeGreaterThanOrEqual(100);
    });

    it('deve adicionar event listeners quando attachListeners é chamado', () => {
      (component as any).attachListeners();
      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('deve remover event listeners quando detachListeners é chamado', () => {
      (component as any).attachListeners();
      (component as any).detachListeners();
      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('não deve adicionar listeners duas vezes', () => {
      (component as any).attachListeners();
      (component as any).attachListeners();
      expect(window.addEventListener).toHaveBeenCalledTimes(2);
    });
  });
});
