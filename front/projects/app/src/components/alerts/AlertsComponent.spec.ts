import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { AlertsComponent } from './AlertsComponent';
import { AlertItem } from '../../models/alert/AlertItemModel';
import { AlertViewItem } from '../../models/alert/AlertViewItemModel';

describe('AlertsComponent', () => {
  let component: AlertsComponent;
  let fixture: ComponentFixture<AlertsComponent>;

  function triggerAlertsChange(): SimpleChanges {
    return {
      alerts: new SimpleChange(undefined, component.alerts, true),
    };
  }

  function createAlertItem(overrides: Partial<AlertViewItem> = {}): AlertViewItem {
    return {
      id: 1,
      variant: 'info',
      title: 'Teste',
      message: 'Mensagem',
      icon: 'i',
      ...overrides,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsComponent);
    component = fixture.componentInstance;
  });

  describe('Criação', () => {
    it('deve criar componente', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('deve usar valores padrão', () => {
      expect(component.alerts).toEqual([]);
      expect(component.autoDismissMs).toBe(5000);
      expect(component.alertItems()).toEqual([]);
    });
  });

  describe('ngOnChanges', () => {
    it('deve popular alertItems quando alerts é fornecido', () => {
      const alerts: AlertItem[] = [
        { variant: 'info', title: 'Info', message: 'Mensagem', icon: 'i' },
      ];

      component.alerts = alerts;
      component.ngOnChanges(triggerAlertsChange());

      expect(component.alertItems().length).toBe(1);
      expect(component.alertItems()[0].title).toBe('Info');
      expect(component.alertItems()[0].id).toBeGreaterThan(0);
    });

    it('deve incrementar ids sequencialmente', () => {
      const alerts: AlertItem[] = [
        { variant: 'info', title: 'A', message: '1', icon: 'i' },
        { variant: 'error', title: 'B', message: '2', icon: 'e' },
      ];

      component.alerts = alerts;
      component.ngOnChanges(triggerAlertsChange());

      expect(component.alertItems()[1].id).toBe(component.alertItems()[0].id + 1);
    });

    it('deve reiniciar alertItems quando alerts muda', () => {
      component.alerts = [{ variant: 'info', title: 'Primeiro', message: '1', icon: 'i' }];
      component.ngOnChanges(triggerAlertsChange());
      const primeiroId = component.alertItems()[0].id;

      component.alerts = [{ variant: 'error', title: 'Segundo', message: '2', icon: 'e' }];
      component.ngOnChanges(triggerAlertsChange());

      expect(component.alertItems().length).toBe(1);
      expect(component.alertItems()[0].title).toBe('Segundo');
      expect(component.alertItems()[0].id).not.toBe(primeiroId);
    });

    it('deve ignorar ngOnChanges quando alerts não mudou', () => {
      const resetSpy = vi.spyOn(component as unknown as { resetAlerts: () => void }, 'resetAlerts');

      component.ngOnChanges({});

      expect(resetSpy).not.toHaveBeenCalled();
    });

    it('deve limpar timers anteriores ao resetar', () => {
      const clearTimersSpy = vi.spyOn(component as unknown as { clearTimers: () => void }, 'clearTimers');

      component.alerts = [{ variant: 'info', title: 'Teste', message: 'Msg', icon: 'i' }];
      component.ngOnChanges(triggerAlertsChange());

      expect(clearTimersSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('autoDismissMs', () => {
    it('deve iniciar timers quando autoDismissMs > 0', () => {
      vi.useFakeTimers();
      component.alerts = [{ variant: 'info', title: 'Auto', message: 'Dismiss', icon: 'i' }];
      component.ngOnChanges(triggerAlertsChange());
      const spy = vi.spyOn(component, 'closeAlert');

      vi.advanceTimersByTime(5000);

      expect(spy).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('deve fechar alerta com autoDismissMs personalizado', () => {
      vi.useFakeTimers();
      component.autoDismissMs = 1000;
      component.alerts = [{ variant: 'warning', title: 'Rápido', message: 'Sumir', icon: 'w' }];
      component.ngOnChanges(triggerAlertsChange());
      const spy = vi.spyOn(component, 'closeAlert');

      vi.advanceTimersByTime(1000);

      expect(spy).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('não deve iniciar timers quando autoDismissMs = 0', () => {
      vi.useFakeTimers();
      component.autoDismissMs = 0;
      component.alerts = [{ variant: 'error', title: 'Perm', message: 'Ficar', icon: 'e' }];
      component.ngOnChanges(triggerAlertsChange());
      const spy = vi.spyOn(component, 'closeAlert');

      vi.advanceTimersByTime(10000);

      expect(spy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('closeAlert', () => {
    it('deve remover alerta e emitir dismissed', () => {
      component.alerts = [{ variant: 'info', title: 'Fechar', message: 'Teste', icon: 'i' }];
      component.ngOnChanges(triggerAlertsChange());
      const emitSpy = vi.spyOn(component.dismissed, 'emit');
      const alertId = component.alertItems()[0].id;

      component.closeAlert(alertId);

      expect(component.alertItems().length).toBe(0);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('não deve emitir dismissed quando id não existe', () => {
      const emitSpy = vi.spyOn(component.dismissed, 'emit');

      component.closeAlert(999);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve limpar timer ao fechar alerta', () => {
      vi.useFakeTimers();
      component.alerts = [{ variant: 'info', title: 'Timer', message: 'Clean', icon: 'i' }];
      component.ngOnChanges(triggerAlertsChange());
      const alertId = component.alertItems()[0].id;

      component.closeAlert(alertId);

      vi.advanceTimersByTime(10000);

      expect(component.alertItems().length).toBe(0);
      vi.useRealTimers();
    });

    it('deve remover alerta específico mantendo outros', () => {
      component.alerts = [
        { variant: 'info', title: 'Um', message: '1', icon: 'i' },
        { variant: 'error', title: 'Dois', message: '2', icon: 'e' },
      ];
      component.ngOnChanges(triggerAlertsChange());
      const primeiroId = component.alertItems()[0].id;

      component.closeAlert(primeiroId);

      expect(component.alertItems().length).toBe(1);
      expect(component.alertItems()[0].title).toBe('Dois');
    });

    it('deve emitir dismissed e chamar clearTimer mesmo sem timer registrado', () => {
      component.alertItems.set([createAlertItem({ id: 5 })]);
      const emitSpy = vi.spyOn(component.dismissed, 'emit');

      component.closeAlert(5);

      expect(component.alertItems().length).toBe(0);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngOnDestroy', () => {
    it('deve limpar timers ao destruir', () => {
      vi.useFakeTimers();
      component.alerts = [{ variant: 'info', title: 'Timer', message: 'Clean', icon: 'i' }];
      component.ngOnChanges(triggerAlertsChange());
      const clearTimersSpy = vi.spyOn(component as unknown as { clearTimers: () => void }, 'clearTimers');

      component.ngOnDestroy();

      expect(clearTimersSpy).toHaveBeenCalledTimes(1);
    });

    it('não deve disparar timers após destruir', () => {
      vi.useFakeTimers();
      component.alerts = [{ variant: 'info', title: 'Timer', message: 'Clean', icon: 'i' }];
      component.ngOnChanges(triggerAlertsChange());
      const spy = vi.spyOn(component, 'closeAlert');

      component.ngOnDestroy();
      vi.advanceTimersByTime(10000);

      expect(spy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('Template', () => {
    it('deve renderizar alertas no DOM', () => {
      component.alertItems.set([createAlertItem({ title: 'Visível', message: 'Aparece' })]);
      fixture.detectChanges();

      const articles = fixture.debugElement.queryAll(By.css('.alert'));
      expect(articles.length).toBe(1);
      expect(articles[0].nativeElement.textContent).toContain('Visível');
      expect(articles[0].nativeElement.textContent).toContain('Aparece');
    });

    it('deve renderizar múltiplos alertas', () => {
      component.alertItems.set([
        createAlertItem({ id: 1, variant: 'info', title: 'A' }),
        createAlertItem({ id: 2, variant: 'error', title: 'B' }),
        createAlertItem({ id: 3, variant: 'warning', title: 'C' }),
      ]);
      fixture.detectChanges();

      const articles = fixture.debugElement.queryAll(By.css('.alert'));
      expect(articles.length).toBe(3);
    });

    it('deve exibir barra de progresso quando autoDismissMs > 0', () => {
      component.alertItems.set([createAlertItem()]);
      fixture.detectChanges();

      const progress = fixture.debugElement.query(By.css('.alert__progress'));
      expect(progress).toBeTruthy();
    });

    it('não deve exibir barra de progresso quando autoDismissMs = 0', () => {
      component.autoDismissMs = 0;
      component.alertItems.set([createAlertItem()]);
      fixture.detectChanges();

      const progress = fixture.debugElement.query(By.css('.alert__progress'));
      expect(progress).toBeNull();
    });

    it('deve fechar alerta ao clicar no botão', () => {
      component.alertItems.set([createAlertItem({ id: 42 })]);
      fixture.detectChanges();
      const spy = vi.spyOn(component, 'closeAlert');

      const button = fixture.debugElement.query(By.css('.alert__close'));
      button.nativeElement.click();

      expect(spy).toHaveBeenCalledWith(42);
    });

    it('deve aplicar classe de variant no artigo', () => {
      component.alertItems.set([createAlertItem({ variant: 'error' })]);
      fixture.detectChanges();

      const article = fixture.debugElement.query(By.css('.alert'));
      expect(article.classes['alert--error']).toBe(true);
    });
  });
});
