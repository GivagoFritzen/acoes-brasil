import { describe, it, expect, beforeEach } from 'vitest';
import { AlertService } from './AlertService';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    service = new AlertService();
  });

  describe('addSuccessAlert', () => {
    it('deve adicionar alerta de sucesso com ícone padrão Check', () => {
      service.addSuccessAlert('Sucesso', 'Operação concluída');

      expect(service.alerts()).toEqual([
        { variant: 'info', title: 'Sucesso', message: 'Operação concluída', icon: 'Check' },
      ]);
    });

    it('deve adicionar alerta de sucesso com ícone personalizado', () => {
      service.addSuccessAlert('Sucesso', 'Operação concluída', 'CustomIcon');

      expect(service.alerts()).toEqual([
        { variant: 'info', title: 'Sucesso', message: 'Operação concluída', icon: 'CustomIcon' },
      ]);
    });
  });

  describe('addErrorAlert', () => {
    it('deve adicionar alerta de erro com ícone padrão Close', () => {
      service.addErrorAlert('Erro', 'Falhou');

      expect(service.alerts()).toEqual([
        { variant: 'error', title: 'Erro', message: 'Falhou', icon: 'Close' },
      ]);
    });

    it('deve adicionar alerta de erro com ícone personalizado', () => {
      service.addErrorAlert('Erro', 'Falhou', 'ErrorIcon');

      expect(service.alerts()).toEqual([
        { variant: 'error', title: 'Erro', message: 'Falhou', icon: 'ErrorIcon' },
      ]);
    });
  });

  describe('addWarningAlert', () => {
    it('deve adicionar alerta de aviso com ícone padrão Warning', () => {
      service.addWarningAlert('Aviso', 'Atenção');

      expect(service.alerts()).toEqual([
        { variant: 'warning', title: 'Aviso', message: 'Atenção', icon: 'Warning' },
      ]);
    });

    it('deve adicionar alerta de aviso com ícone personalizado', () => {
      service.addWarningAlert('Aviso', 'Atenção', 'WarnIcon');

      expect(service.alerts()).toEqual([
        { variant: 'warning', title: 'Aviso', message: 'Atenção', icon: 'WarnIcon' },
      ]);
    });
  });

  describe('dismissAlert', () => {
    it('deve remover alerta específico', () => {
      service.addErrorAlert('Erro', 'Falhou');
      const alert = service.alerts()[0];

      service.dismissAlert(alert);

      expect(service.alerts()).toEqual([]);
    });

    it('não deve remover outros alertas ao dispensar um específico', () => {
      service.addSuccessAlert('Sucesso', 'Ok');
      service.addErrorAlert('Erro', 'Falhou');
      const alertSucesso = service.alerts()[0];

      service.dismissAlert(alertSucesso);

      expect(service.alerts().length).toBe(1);
      expect(service.alerts()[0].variant).toBe('error');
    });
  });

  describe('clearAlerts', () => {
    it('deve limpar todos os alertas', () => {
      service.addSuccessAlert('A', '1');
      service.addWarningAlert('B', '2');
      service.addErrorAlert('C', '3');

      service.clearAlerts();

      expect(service.alerts()).toEqual([]);
    });

    it('deve manter alertas vazio se já estiver vazio', () => {
      service.clearAlerts();

      expect(service.alerts()).toEqual([]);
    });
  });

  describe('alerts signal', () => {
    it('deve acumular múltiplos alertas', () => {
      service.addSuccessAlert('Primeiro', '1');
      service.addWarningAlert('Segundo', '2');
      service.addErrorAlert('Terceiro', '3');

      expect(service.alerts().length).toBe(3);
      expect(service.alerts()[0].variant).toBe('info');
      expect(service.alerts()[1].variant).toBe('warning');
      expect(service.alerts()[2].variant).toBe('error');
    });

    it('deve refletir mudanças no signal após adicionar alerta', () => {
      expect(service.alerts().length).toBe(0);

      service.addSuccessAlert('Novo', 'Mensagem');

      expect(service.alerts().length).toBe(1);
    });
  });
});
