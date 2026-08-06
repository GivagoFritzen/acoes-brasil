import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './TranslatePipe';
import { TranslationService } from '../services/TranslationService';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let mockTranslationService: {
    currentLang$: Subject<string>;
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockTranslationService = {
      currentLang$: new Subject<string>(),
      get: vi.fn().mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'common.save': 'Salvar',
          'common.cancel': 'Cancelar',
        };
        return translations[key] || '';
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  afterEach(() => {
    pipe.ngOnDestroy();
  });

  describe('transform', () => {
    it('Deve retornar traducao quando chave existe', () => {
      const resultado = pipe.transform('common.save');
      expect(resultado).toBe('Salvar');
    });

    it('Deve retornar chave quando traducao nao existe', () => {
      const resultado = pipe.transform('chave.inexistente');
      expect(resultado).toBe('chave.inexistente');
    });

    it('Deve retornar string vazia quando chave vazia', () => {
      const resultado = pipe.transform('');
      expect(resultado).toBe('');
    });
  });

  describe('Atualizacao de idioma', () => {
    it('Deve atualizar valor quando idioma muda', () => {
      pipe.transform('common.save');
      expect(pipe['lastValue']).toBe('Salvar');

      mockTranslationService.get.mockReturnValueOnce('Save');
      mockTranslationService.currentLang$.next('en-US');

      const resultado = pipe.transform('common.save');
      expect(resultado).toBe('Save');
    });
  });

  describe('ngOnDestroy', () => {
    it('Deve completar destroy$ no OnDestroy', () => {
      const destroy$ = pipe['destroy$'];
      const completeSpy = vi.spyOn(destroy$, 'complete');

      pipe.ngOnDestroy();

      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
