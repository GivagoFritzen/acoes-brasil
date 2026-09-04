import { TestBed } from '@angular/core/testing';
import { NotificationService } from './NotificationService';
import { AlertItem } from '../models/alert/AlertItemModel';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
  });

  it('deve ser instanciado com lista de alertas vazia', () => {
    expect(service.alerts()).toEqual([]);
  });

  it('deve adicionar alerta de sucesso', () => {
    service.success('Operação realizada');
    const alerts = service.alerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].variant).toBe('info');
    expect(alerts[0].message).toBe('Operação realizada');
    expect(alerts[0].icon).toBe('✓');
  });

  it('deve adicionar alerta de erro', () => {
    service.error('Falha na operação');
    const alerts = service.alerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].variant).toBe('error');
    expect(alerts[0].message).toBe('Falha na operação');
    expect(alerts[0].icon).toBe('✕');
  });

  it('deve adicionar alerta de warning', () => {
    service.warning('Atenção ao prazo');
    const alerts = service.alerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].variant).toBe('warning');
    expect(alerts[0].message).toBe('Atenção ao prazo');
  });

  it('deve remover um alerta específico ao chamar dismiss', () => {
    const alert: AlertItem = {
      variant: 'info',
      title: 'Teste',
      message: 'Msg',
      icon: '✓',
    };
    service.addAlert(alert);
    expect(service.alerts().length).toBe(1);

    service.dismiss(alert);
    expect(service.alerts().length).toBe(0);
  });

  it('deve limpar todos os alertas', () => {
    service.success('Msg 1');
    service.clear();
    expect(service.alerts()).toEqual([]);
  });
});
