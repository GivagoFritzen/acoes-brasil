import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { AddPortfolioModalComponent } from './add-portfolio-modal.component';

describe('AddPortfolioModalComponent', () => {
  let component: AddPortfolioModalComponent;
  let fixture: ComponentFixture<AddPortfolioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPortfolioModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPortfolioModalComponent);
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
  });

  describe('Signals Padrão', () => {
    it('deve usar codigo vazio como padrão', () => {
      expect(component.codigo()).toBe('');
    });

    it('deve usar quantidade null como padrão', () => {
      expect(component.quantidade()).toBeNull();
    });

    it('deve usar precoMedio null como padrão', () => {
      expect(component.precoMedio()).toBeNull();
    });

    it('deve usar validationMessage vazia como padrão', () => {
      expect(component.validationMessage()).toBe('');
    });
  });

  describe('ngOnChanges', () => {
    it('deve resetar form quando isOpen mudar para true', () => {
      component.codigo.set('TEST11');
      component.quantidade.set(100);
      component.precoMedio.set(50);
      component.validationMessage.set('erro');

      component.ngOnChanges({
        isOpen: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false,
        } as any,
      });

      expect(component.codigo()).toBe('');
      expect(component.quantidade()).toBeNull();
      expect(component.precoMedio()).toBeNull();
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
        } as any,
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
        } as any,
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

  describe('handlePrecoMedioChange', () => {
    it('deve parsear precoMedio em handlePrecoMedioChange', () => {
      component.handlePrecoMedioChange('50.50');
      expect(component.precoMedio()).toBe(50.5);
    });

    it('deve definir null para valor inválido', () => {
      component.handlePrecoMedioChange('abc');
      expect(component.precoMedio()).toBeNull();
    });

    it('deve permitir zero como precoMedio', () => {
      component.handlePrecoMedioChange('0');
      expect(component.precoMedio()).toBe(0);
    });
  });

  describe('submit', () => {
    it('deve emitir saved com payload válido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.quantidade.set(100);
      component.precoMedio.set(30);

      component.submit();

      expect(emitSpy).toHaveBeenCalledWith({
        codigo: 'PETR11',
        quantidade: 100,
        precoMedio: 30,
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
      component.quantidade.set(100);
      component.precoMedio.set(30);
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com quantidade zero', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.quantidade.set(0);
      component.precoMedio.set(30);
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com quantidade negativa', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.quantidade.set(-10);
      component.precoMedio.set(30);
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com precoMedio null', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.quantidade.set(100);
      component.precoMedio.set(null as any);
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com precoMedio negativo', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.quantidade.set(100);
      component.precoMedio.set(-30);
      component.submit();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('deve NÃO emitir saved com código inválido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('INVALID');
      component.quantidade.set(100);
      component.precoMedio.set(30);
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
      component.precoMedio.set(30);
      component.submit();
      expect(component.validationMessage()).toContain('Código inválido');
    });

    it('deve limpar validationMessage quando payload válido', () => {
      component.validationMessage.set('erro anterior');
      component.codigo.set('PETR11');
      component.quantidade.set(100);
      component.precoMedio.set(30);
      component.submit();
      expect(component.validationMessage()).toBe('');
    });

    it('deve truncar quantidade em payload', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR11');
      component.quantidade.set(100.9);
      component.precoMedio.set(30);
      component.submit();
      const payload = emitSpy.mock.calls[0]?.[0];
      expect(payload?.quantidade).toBe(100);
    });

    it('deve aceitar código de ação válido', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.quantidade.set(100);
      component.precoMedio.set(30);
      component.submit();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('deve aceitar código de FII válido (termina com 11)', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('XPLG11');
      component.quantidade.set(100);
      component.precoMedio.set(100);
      component.submit();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('deve aceitar código de BDR válido (termina com 34)', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('AAPL34');
      component.quantidade.set(10);
      component.precoMedio.set(150);
      component.submit();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('deve aceitar precoMedio zero', () => {
      const emitSpy = vi.spyOn(component.saved, 'emit');
      component.codigo.set('PETR4F');
      component.quantidade.set(100);
      component.precoMedio.set(0);
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