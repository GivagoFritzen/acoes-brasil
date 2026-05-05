import { of } from 'rxjs';
import { TranslationService } from './translation.service';
import { ChangeDetectionService } from './change-detection.service';

describe('TranslationService', () => {
  it('deve carregar idioma e resolver chaves aninhadas', async () => {
    const http = {
      get: () => of({ common: { save: 'Salvar' } }),
    } as any;
    const changeDetectionService = {
      triggerChangeDetection: vi.fn(),
    } as unknown as ChangeDetectionService;

    const service = new TranslationService(http, changeDetectionService);

    await service.loadLanguage('pt-BR');

    expect(service.getCurrentLanguage()).toBe('pt-BR');
    expect(service.get('common.save')).toBe('Salvar');
    expect(service.has('common.save')).toBe(true);
    expect(changeDetectionService.triggerChangeDetection).toHaveBeenCalled();
  });

  it('deve retornar string vazia para chave inexistente', () => {
    const http = { get: () => of({}) } as any;
    const changeDetectionService = { triggerChangeDetection: vi.fn() } as unknown as ChangeDetectionService;

    const service = new TranslationService(http, changeDetectionService);

    expect(service.get('inexistente.chave')).toBe('');
    expect(service.has('inexistente.chave')).toBe(false);
  });
});
