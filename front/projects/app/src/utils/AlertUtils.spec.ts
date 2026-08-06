import { filterAlert } from './AlertUtils';
import { AlertItem } from '../models/alert/AlertItemModel';

describe('filterAlert', () => {
  it('Deve retornar true quando variant diferente', () => {
    const alert: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const item: AlertItem = {
      variant: 'info',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const filtro = filterAlert(alert);
    expect(filtro(item)).toBe(true);
  });

  it('Deve retornar true quando title diferente', () => {
    const alert: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const item: AlertItem = {
      variant: 'error',
      title: 'Sucesso',
      message: 'Falha',
      icon: '✕',
    };

    const filtro = filterAlert(alert);
    expect(filtro(item)).toBe(true);
  });

  it('Deve retornar true quando message diferente', () => {
    const alert: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const item: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Sucesso',
      icon: '✕',
    };

    const filtro = filterAlert(alert);
    expect(filtro(item)).toBe(true);
  });

  it('Deve retornar true quando icon diferente', () => {
    const alert: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const item: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✓',
    };

    const filtro = filterAlert(alert);
    expect(filtro(item)).toBe(true);
  });

  it('Deve retornar false quando todos campos sao iguais', () => {
    const alert: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const item: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const filtro = filterAlert(alert);
    expect(filtro(item)).toBe(false);
  });

  it('Deve retornar true quando todos campos diferentes', () => {
    const alert: AlertItem = {
      variant: 'error',
      title: 'Erro',
      message: 'Falha',
      icon: '✕',
    };

    const item: AlertItem = {
      variant: 'info',
      title: 'Sucesso',
      message: 'OK',
      icon: '✓',
    };

    const filtro = filterAlert(alert);
    expect(filtro(item)).toBe(true);
  });
});
