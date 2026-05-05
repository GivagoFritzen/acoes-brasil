import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    service = new AlertService();
  });

  it('deve adicionar alerta de sucesso com ícone padrão', () => {
    service.addSuccessAlert('Sucesso', 'Operação concluída');

    expect(service.alerts()).toEqual([
      { variant: 'info', title: 'Sucesso', message: 'Operação concluída', icon: 'Check' },
    ]);
  });

  it('deve remover alerta específico', () => {
    service.addErrorAlert('Erro', 'Falhou');
    const alert = service.alerts()[0];

    service.dismissAlert(alert);

    expect(service.alerts()).toEqual([]);
  });

  it('deve limpar todos os alertas', () => {
    service.addSuccessAlert('A', '1');
    service.addWarningAlert('B', '2');

    service.clearAlerts();

    expect(service.alerts()).toEqual([]);
  });
});
