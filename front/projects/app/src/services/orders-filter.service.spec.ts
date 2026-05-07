import { OrdersFilterService } from './orders-filter.service';
import { OrderOperacao } from '../models';

describe('OrdersFilterService', () => {
  let service: OrdersFilterService;

  beforeEach(() => {
    service = new OrdersFilterService();
  });

  describe('updateCodigo', () => {
    it('deve atualizar signal codigo com valor fornecido', () => {
      service.updateCodigo('PETR4');
      expect(service.codigo()).toBe('PETR4');
    });

    it('deve atualizar signal codigo com valor vazio', () => {
      service.updateCodigo('');
      expect(service.codigo()).toBe('');
    });
  });

  describe('updateOperacao', () => {
    it('deve atualizar signal operacao para Compra quando valor válido', () => {
      service.updateOperacao('Compra');
      expect(service.operacao()).toBe('Compra' as OrderOperacao);
    });

    it('deve atualizar signal operacao para Venda quando valor válido', () => {
      service.updateOperacao('Venda');
      expect(service.operacao()).toBe('Venda' as OrderOperacao);
    });

    it('deve limpar signal operacao quando valor inválido', () => {
      service.updateOperacao('Invalido');
      expect(service.operacao()).toBe('');
    });

    it('deve limpar signal operacao quando valor vazio', () => {
      service.updateOperacao('');
      expect(service.operacao()).toBe('');
    });
  });

  describe('updateData', () => {
    it('deve atualizar signal data com valor fornecido', () => {
      service.updateData('2026-01-10');
      expect(service.data()).toBe('2026-01-10');
    });

    it('deve atualizar signal data com valor vazio', () => {
      service.updateData('');
      expect(service.data()).toBe('');
    });
  });

  describe('updateDataFinal', () => {
    it('deve atualizar signal dataFinal com valor fornecido', () => {
      service.updateDataFinal('2026-01-20');
      expect(service.dataFinal()).toBe('2026-01-20');
    });

    it('deve atualizar signal dataFinal com valor vazio', () => {
      service.updateDataFinal('');
      expect(service.dataFinal()).toBe('');
    });
  });

  describe('applyFilters', () => {
    it('deve retornar filtros aplicados com todos os campos preenchidos', () => {
      service.updateCodigo('PETR4');
      service.updateOperacao('Compra');
      service.updateData('2026-01-10');
      service.updateDataFinal('2026-01-20');

      const applied = service.applyFilters();

      expect(applied).toEqual({
        codigo: 'PETR4',
        operacao: 'Compra',
        dataInicial: '2026-01-10',
        dataFinal: '2026-01-20',
      });
    });

    it('deve retornar filtros aplicados com campos vazios', () => {
      const applied = service.applyFilters();

      expect(applied).toEqual({
        codigo: '',
        operacao: '',
        dataInicial: '',
        dataFinal: '',
      });
    });

    it('deve atualizar signals aplicados ao aplicar filtros', () => {
      service.updateCodigo('ITUB4');
      service.updateOperacao('Venda');

      service.applyFilters();

      expect(service.codigoAplicado()).toBe('ITUB4');
      expect(service.operacaoAplicado()).toBe('Venda');
    });
  });

  describe('clearFilters', () => {
    it('deve limpar filtros correntes e aplicados', () => {
      service.updateCodigo('ITUB4');
      service.updateOperacao('Compra');
      service.applyFilters();

      service.clearFilters();

      expect(service.codigo()).toBe('');
      expect(service.operacao()).toBe('');
      expect(service.codigoAplicado()).toBe('');
      expect(service.operacaoAplicado()).toBe('');
    });

    it('deve limpar filtros mantendo aplicados inalterados antes de clear', () => {
      service.updateCodigo('PETR4');
      service.applyFilters();
      service.updateCodigo('');

      service.clearFilters();

      expect(service.getAppliedFilters()).toEqual({ codigo: '', operacao: '', dataInicial: '', dataFinal: '' });
    });
  });

  describe('hasActiveFilters', () => {
    it('deve retornar true quando codigo aplicado preenchido', () => {
      service.updateCodigo('PETR4');
      service.applyFilters();

      expect(service.hasActiveFilters()).toBe(true);
    });

    it('deve retornar true quando operacao aplicado preenchido', () => {
      service.updateOperacao('Compra');
      service.applyFilters();

      expect(service.hasActiveFilters()).toBe(true);
    });

    it('deve retornar true quando data aplicado preenchido', () => {
      service.updateData('2026-01-10');
      service.applyFilters();

      expect(service.hasActiveFilters()).toBe(true);
    });

    it('deve retornar true quando dataFinal aplicado preenchido', () => {
      service.updateDataFinal('2026-01-20');
      service.applyFilters();

      expect(service.hasActiveFilters()).toBe(true);
    });

    it('deve retornar false quando nenhum filtro aplicado', () => {
      expect(service.hasActiveFilters()).toBe(false);
    });
  });

  describe('getAppliedFilters', () => {
    it('deve retornar filtros aplicados corretos', () => {
      service.updateCodigo('PETR4');
      service.updateOperacao('Compra');
      service.updateData('2026-01-10');
      service.updateDataFinal('2026-01-20');
      service.applyFilters();

      const filters = service.getAppliedFilters();

      expect(filters).toEqual({
        codigo: 'PETR4',
        operacao: 'Compra',
        dataInicial: '2026-01-10',
        dataFinal: '2026-01-20',
      });
    });

    it('deve retornar filtros vazios quando não aplicados', () => {
      const filters = service.getAppliedFilters();

      expect(filters).toEqual({
        codigo: '',
        operacao: '',
        dataInicial: '',
        dataFinal: '',
      });
    });
  });

  describe('toOrderOperacao', () => {
    it('deve aceitar Compra como operação válida via updateOperacao', () => {
      service.updateOperacao('Compra');
      expect(service.operacao()).toBe('Compra');
    });

    it('deve aceitar Venda como operação válida via updateOperacao', () => {
      service.updateOperacao('Venda');
      expect(service.operacao()).toBe('Venda');
    });

    it('deve rejeitar operação inválida via updateOperacao', () => {
      service.updateOperacao('Invalido');
      expect(service.operacao()).toBe('');
    });
  });
});
