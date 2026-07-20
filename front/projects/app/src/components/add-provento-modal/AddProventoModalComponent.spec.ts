import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AddProventoModalComponent } from './AddProventoModalComponent';

describe('AddProventoModalComponent', () => {
  let component: AddProventoModalComponent;
  let fixture: ComponentFixture<AddProventoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProventoModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddProventoModalComponent);
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

    it('deve usar tipoOptions vazio como padrão', () => {
      expect(component.tipoOptions).toEqual([]);
    });
  });

  describe('Signals Padrão', () => {
    it('deve usar codigo vazio como padrão', () => {
      expect(component.codigo()).toBe('');
    });

    it('deve usar tipo = Dividendo como padrão', () => {
      expect(component.tipo()).toBe('Dividendo');
    });

    it('deve usar instituicao vazia como padrão', () => {
      expect(component.instituicao()).toBe('');
    });

    it('deve usar quantidade null como padrão', () => {
      expect(component.quantidade()).toBeNull();
    });

    it('deve usar precoUnitario null como padrão', () => {
      expect(component.precoUnitario()).toBeNull();
    });

    it('deve usar valorLiquido null como padrão', () => {
      expect(component.valorLiquido()).toBeNull();
    });

    it('deve usar data vazia como padrão', () => {
      expect(component.data()).toBe('');
    });

    it('deve usar validationMessage vazia como padrão', () => {
      expect(component.validationMessage()).toBe('');
    });
  });

  describe('ngOnChanges', () => {
    it('deve resetar form quando isOpen mudar para true', () => {
      component.codigo.set('TEST11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
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
      expect(component.tipo()).toBe('Dividendo');
      expect(component.instituicao()).toBe('');
      expect(component.quantidade()).toBeNull();
      expect(component.precoUnitario()).toBeNull();
      expect(component.valorLiquido()).toBeNull();
      expect(component.data()).toBe('');
      expect(component.validationMessage()).toBe('');
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

    it('deve manter código vazio quando entrada vazia', () => {
      component.handleCodigoChange('');
      expect(component.codigo()).toBe('');
    });
  });

  describe('handleTipoChange', () => {
    it('deve atualizar tipo em handleTipoChange', () => {
      component.handleTipoChange('Juros');
      expect(component.tipo()).toBe('Juros');
    });
  });

  describe('handleInstituicaoChange', () => {
    it('deve atualizar instituicao em handleInstituicaoChange', () => {
      component.handleInstituicaoChange('Banco do Brasil');
      expect(component.instituicao()).toBe('Banco do Brasil');
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
  });

  describe('handlePrecoUnitarioChange', () => {
    it('deve parsear precoUnitario em handlePrecoUnitarioChange', () => {
      component.handlePrecoUnitarioChange('10.50');
      expect(component.precoUnitario()).toBe(10.5);
    });

    it('deve definir null para valor inválido', () => {
      component.handlePrecoUnitarioChange('abc');
      expect(component.precoUnitario()).toBeNull();
    });

    it('deve permitir zero como precoUnitario', () => {
      component.handlePrecoUnitarioChange('0');
      expect(component.precoUnitario()).toBe(0);
    });
  });

  describe('handleValorLiquidoChange', () => {
    it('deve parsear valorLiquido em handleValorLiquidoChange', () => {
      component.handleValorLiquidoChange('1000.50');
      expect(component.valorLiquido()).toBe(1000.5);
    });

    it('deve definir null para valor inválido', () => {
      component.handleValorLiquidoChange('abc');
      expect(component.valorLiquido()).toBeNull();
    });

    it('deve permitir zero como valorLiquido', () => {
      component.handleValorLiquidoChange('0');
      expect(component.valorLiquido()).toBe(0);
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
      component.codigo.set('PETR11');
      component.tipo.set('Dividendo');
      component.instituicao.set('Banco do Brasil');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');

      component.submit();

      expect(emitSpy).toHaveBeenCalledWith({
        codigo: 'PETR11',
        tipo: 'Dividendo',
        instituicao: 'Banco do Brasil',
        quantidade: 100,
        precoUnitario: 10,
        valorLiquido: 1000,
        data: '2025-01-01',
      });
    });

    it('deve NÃO emitir saved com campos vazios', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com código vazio', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com instituição vazia', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com data vazia', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com quantidade zero', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(0);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com quantidade negativa', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(-10);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com precoUnitario null', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(null!);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com precoUnitario negativo', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(-10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com valorLiquido null', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(null!);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com valorLiquido negativo', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(-1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com código inválido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('INVALID');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
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
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
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
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(component.validationMessage()).toContain('Código inválido');
    });

    it('deve mostrar mensagem de validação para data futura', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      component.codigo.set('PETR11');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set(futureDateStr);
      component.submit();
      expect(component.validationMessage()).toBe('A data do provento não pode ser futura.');
    });

    it('deve limpar validationMessage quando payload válido', () => {
      component.validationMessage.set('erro anterior');
      component.codigo.set('PETR11');
      component.tipo.set('Dividendo');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      expect(component.validationMessage()).toBe('');
    });

    it('deve truncar quantidade em payload', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.tipo.set('Dividendo');
      component.instituicao.set('Banco');
      component.quantidade.set(100.9);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      const payload = emitSpy.mock.calls[0]?.[0];
      expect(payload?.quantidade).toBe(100);
    });

    it('deve criar payload com tipo JurosSobreCapitalProprio', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.tipo.set('JurosSobreCapitalProprio');
      component.instituicao.set('Banco');
      component.quantidade.set(100);
      component.precoUnitario.set(10);
      component.valorLiquido.set(1000);
      component.data.set('2025-01-01');
      component.submit();
      const payload = emitSpy.mock.calls[0]?.[0];
      expect(payload?.tipo).toBe('JurosSobreCapitalProprio');
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