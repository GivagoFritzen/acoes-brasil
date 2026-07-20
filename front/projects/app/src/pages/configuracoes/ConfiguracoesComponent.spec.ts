import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { ConfiguracoesComponent } from './ConfiguracoesComponent';
import { TranslationService } from '../../services/TranslationService';
import { SettingsService } from '../../services/SettingsService';

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let fixture: ComponentFixture<ConfiguracoesComponent>;
  let mockTranslationService: {
    loadLanguage: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    has: ReturnType<typeof vi.fn>;
    getCurrentLanguage: ReturnType<typeof vi.fn>;
    currentLang$: { subscribe: ReturnType<typeof vi.fn> };
  };
  let mockSettingsService: {
    theme: ReturnType<typeof vi.fn>;
    language: ReturnType<typeof vi.fn>;
    setLanguage: ReturnType<typeof vi.fn>;
    setTheme: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockTranslationService = {
      loadLanguage: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockReturnValue(''),
      has: vi.fn().mockReturnValue(false),
      getCurrentLanguage: vi.fn().mockReturnValue('pt-BR'),
      currentLang$: { subscribe: vi.fn() },
    };

    mockSettingsService = {
      theme: vi.fn().mockReturnValue('light'),
      language: vi.fn().mockReturnValue('pt-BR'),
      setLanguage: vi.fn(),
      setTheme: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ConfiguracoesComponent],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Criação', () => {
    it('deve criar componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve ter 2 opções de idioma', () => {
      expect(component.languages.length).toBe(2);
      expect(component.languages[0].code).toBe('pt-BR');
      expect(component.languages[1].code).toBe('en-US');
    });
  });

  describe('selecionarIdioma', () => {
    it('deve salvar idioma no SettingsService e carregar tradução', async () => {
      await component.selecionarIdioma('en-US');
      expect(mockSettingsService.setLanguage).toHaveBeenCalledWith('en-US');
      expect(mockTranslationService.loadLanguage).toHaveBeenCalledWith('en-US');
    });
  });

  describe('alternarTema', () => {
    it('deve alternar de light para dark', () => {
      mockSettingsService.theme.mockReturnValue('light');
      component.alternarTema();
      expect(mockSettingsService.setTheme).toHaveBeenCalledWith('dark');
    });

    it('deve alternar de dark para light', () => {
      mockSettingsService.theme.mockReturnValue('dark');
      component.alternarTema();
      expect(mockSettingsService.setTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Renderização', () => {
    it('deve exibir botões de idioma', () => {
      const botoes = fixture.debugElement.queryAll(By.css('.configuracoes__idioma-btn'));
      expect(botoes.length).toBe(2);
    });

    it('deve marcar idioma ativo', () => {
      const botoes = fixture.debugElement.queryAll(By.css('.configuracoes__idioma-btn'));
      expect(botoes[0].nativeElement.classList.contains('configuracoes__idioma-btn--active')).toBe(true);
    });
  });
});
