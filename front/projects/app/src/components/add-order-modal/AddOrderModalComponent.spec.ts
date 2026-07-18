import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AddOrderModalComponent } from './AddOrderModalComponent';

describe('AddOrderModalComponent', () => {
  let component: AddOrderModalComponent;
  let fixture: ComponentFixture<AddOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrderModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Criação', () => {
    it('deve criar componente', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Inputs Padrão', () => {
    it('deve usar isOpen = false como padrão', () => {
      expect(component.isOpen).toBe(false);
    });

    it('deve usar isSaving = false como padrão', () => {
      expect(component.isSaving).toBe(false);
    });

    it('deve usar operacaoOptions vazio como padrão', () => {
      expect(component.operacaoOptions).toEqual([]);
    });
  });

  describe('Signals Padrão', () => {
    it('deve usar codigo vazio como padrão', () => {
      expect(component.codigo()).toBe('');
    });

    it('deve usar operacao = Compra como padrão', () => {
      expect(component.operacao()).toBe('Compra');
    });

    it('deve usar quantidade null como padrão', () => {
      expect(component.quantidade()).toBeNull();
    });

    it('deve usar valor null como padrão', () => {
      expect(component.valor()).toBeNull();
    });

    it('deve usar data vazia como padrão', () => {
      expect(component.data()).toBe('');
    });

    it('deve usar validationMessage vazia como padrão', () => {
      expect(component.validationMessage()).toBe('');
    });

    it('deve usar tipoDetectado null como padrão', () => {
      expect(component.tipoDetectado()).toBeNull();
    });
  });

  describe('ngOnChanges', () => {
    it('deve resetar form quando isOpen mudar para true', () => {
      component.codigo.set('TEST11');
      component.operacao.set('Venda');
      component.quantidade.set(100);
      component.valor.set(50);
      component.data.set('2025-01-01');
      component.validationMessage.set('erro');

      component.ngOnChanges({
        isOpen: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false,
        }
      });

      expect(component.codigo()).toBe('');
      expect(component.operacao()).toBe('Compra');
      expect(component.quantidade()).toBeNull();
      expect(component.valor()).toBeNull();
      expect(component.data()).toBe('');
      expect(component.validationMessage()).toBe('');
      expect(component.tipoDetectado()).toBeNull();
    });

    it('deve NÃO resetar form se isOpen já era true', () => {
      component.codigo.set('TEST11');

      component.ngOnChanges({
        isOpen: {
          currentValue: true,
          previousValue: true,
          firstChange: false,
          isFirstChange: () => true,
        }
      });

      expect(component.codigo()).toBe('TEST11');
    });

    it('deve NÃO resetar se isOpen for false', () => {
      component.codigo.set('TEST11');

      component.ngOnChanges({
        isOpen: {
          currentValue: false,
          previousValue: true,
          firstChange: false,
          isFirstChange: () => false,
        }
      });

      expect(component.codigo()).toBe('TEST11');
    });
  });

  describe('handleCodigoChange', () => {
    it('deve normalizar código em handleCodigoChange', () => {
      component.handleCodigoChange('test 11');
      expect(component.codigo()).toBe('TEST11');
    });

    it('deve detectar tipo de ação quando código termina com 3 e sufixo F', () => {
      component.handleCodigoChange('PETR3F');
      expect(component.tipoDetectado()).toBe('ACAO');
    });

    it('deve detectar tipo de ação quando código termina com 4 e sufixo F', () => {
      component.handleCodigoChange('PETR4F');
      expect(component.tipoDetectado()).toBe('ACAO');
    });

    it('deve detectar tipo FII quando código termina com 11', () => {
      component.handleCodigoChange('XPLG11');
      expect(component.tipoDetectado()).toBe('FII');
    });

    it('deve detectar tipo BDR quando código termina com 34', () => {
      component.handleCodigoChange('AAPL34');
      expect(component.tipoDetectado()).toBe('BDR');
    });

    it('deve limpar tipoDetectado quando código vazio', () => {
      component.tipoDetectado.set('ACAO');
      component.handleCodigoChange('');
      expect(component.tipoDetectado()).toBeNull();
    });

    it('deve retornar null para código inválido', () => {
      component.handleCodigoChange('INVALID');
      expect(component.tipoDetectado()).toBeNull();
    });
  });

  describe('handleOperacaoChange', () => {
    it('deve atualizar operacao em handleOperacaoChange', () => {
      component.handleOperacaoChange('Venda');
      expect(component.operacao()).toBe('Venda');
    });
  });

  describe('handleQuantidadeChange', () => {
    it('deve parsear quantidade em handleQuantidadeChange', () => {
      component.handleQuantidadeChange('100');
      expect(component.quantidade()).toBe(100);
    });

    it('deve definir null para valor inválido', () => {
      component.handleQuantidadeChange('abc');
      expect(component.quantidade()).toBeNull();
    });

    it('deve definir null para Infinity', () => {
      component.handleQuantidadeChange('Infinity');
      expect(component.quantidade()).toBeNull();
    });
  });

  describe('handleValorChange', () => {
    it('deve parsear valor em handleValorChange', () => {
      component.handleValorChange('50.50');
      expect(component.valor()).toBe(50.5);
    });

    it('deve definir null para valor inválido', () => {
      component.handleValorChange('abc');
      expect(component.valor()).toBeNull();
    });
  });

  describe('handleDataChange', () => {
    it('deve atualizar data em handleDataChange', () => {
      component.handleDataChange('2025-01-01');
      expect(component.data()).toBe('2025-01-01');
    });
  });

  describe('submit', () => {
    it('deve emitir saved com payload válido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.operacao.set('Compra');
      component.quantidade.set(100);
      component.valor.set(30);
      component.data.set('2025-01-01');

      component.submit();

      expect(emitSpy).toHaveBeenCalledWith({
        codigo: 'PETR4F',
        operacao: 'Compra',
        tipo: 'ACAO',
        quantidade: 100,
        valor: 30,
        data: '2025-01-01',
      });
    });

    it('deve NÃO emitir saved com campos vazios', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com quantidade zero', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.quantidade.set(0);
      component.valor.set(30);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com quantidade negativa', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.quantidade.set(-10);
      component.valor.set(30);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com valor zero', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.quantidade.set(100);
      component.valor.set(0);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com valor negativo', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.quantidade.set(100);
      component.valor.set(-30);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com código inválido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('INVALID');
      component.quantidade.set(100);
      component.valor.set(30);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com data futura', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      component.codigo.set('PETR4F');
      component.quantidade.set(100);
      component.valor.set(30);
      component.data.set(tomorrowStr);
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve mostrar mensagem de validação para campos inválidos', () => {
      component.submit();
      expect(component.validationMessage()).toBe('Preencha todos os campos com valores válidos.');
    });

    it('deve mostrar mensagem de validação para código inválido', () => {
      component.codigo.set('INVALID');
      component.quantidade.set(100);
      component.valor.set(30);
      component.data.set('2025-01-01');
      component.submit();
      expect(component.validationMessage()).toContain('Código inválido');
    });

    it('deve mostrar mensagem de validação para data futura', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      component.codigo.set('PETR4F');
      component.quantidade.set(100);
      component.valor.set(30);
      component.data.set(tomorrowStr);
      component.submit();
      expect(component.validationMessage()).toBe('A data da ordem não pode ser futura.');
    });

    it('deve limpar validationMessage quando payload válido', () => {
      component.validationMessage.set('erro anterior');
      component.codigo.set('PETR4F');
      component.operacao.set('Compra');
      component.quantidade.set(100);
      component.valor.set(30);
      component.data.set('2025-01-01');
      component.submit();
      expect(component.validationMessage()).toBe('');
    });

    it('deve truncar quantidade em payload', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.operacao.set('Compra');
      component.quantidade.set(100.9);
      component.valor.set(30);
      component.data.set('2025-01-01');
      component.submit();
      const payload = emitSpy.mock.calls[0]?.[0];
      expect(payload?.quantidade).toBe(100);
    });

    it('deve aceitar código FII válido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('XPLG11');
      component.operacao.set('Compra');
      component.quantidade.set(100);
      component.valor.set(100);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('deve aceitar código BDR válido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('AAPL34');
      component.operacao.set('Compra');
      component.quantidade.set(10);
      component.valor.set(150);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('deve emitir closed quando close chamado e não está salvando', () => {
      const emitSpy = vi.spyOn(component.closed, 'emit');
      component.isSaving = false;
      component.close();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('deve NÃO emitir closed quando close chamado e está salvando', () => {
      const emitSpy = vi.spyOn(component.closed, 'emit');
      component.isSaving = true;
      component.close();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleBackdropClick', () => {
    it('deve chamar close ao clicar no backdrop', () => {
      const closeSpy = vi.spyOn(component, 'close');
      component.handleBackdropClick();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  
});