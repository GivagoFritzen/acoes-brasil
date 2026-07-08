import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsService } from './SettingsService';

const STORAGE_KEY_LANG = 'app_language';
const STORAGE_KEY_THEME = 'app_theme';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    service = new SettingsService();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('inicialização', () => {
    it('deve iniciar com theme light', () => {
      expect(service.theme()).toBe('light');
    });

    it('deve iniciar com language pt-BR', () => {
      expect(service.language()).toBe('pt-BR');
    });

    it('deve carregar language salva do localStorage', () => {
      localStorage.setItem(STORAGE_KEY_LANG, 'en-US');
      const svc = new SettingsService();
      expect(svc.language()).toBe('en-US');
    });

    it('deve carregar theme salva do localStorage', () => {
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
      const svc = new SettingsService();
      expect(svc.theme()).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('deve atualizar theme signal', () => {
      service.setTheme('dark');
      expect(service.theme()).toBe('dark');
    });

    it('deve salvar theme no localStorage', () => {
      service.setTheme('dark');
      expect(localStorage.getItem(STORAGE_KEY_THEME)).toBe('dark');
    });

    it('deve aplicar atributo data-theme no HTML quando dark', () => {
      service.setTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('deve remover atributo data-theme quando light', () => {
      service.setTheme('dark');
      service.setTheme('light');
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('deve lidar com erro ao salvar no localStorage', () => {
      const setItemOriginal = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => { throw new Error('erro'); });
      expect(() => service.setTheme('dark')).not.toThrow();
      Storage.prototype.setItem = setItemOriginal;
    });
  });

  describe('setLanguage', () => {
    it('deve atualizar language signal', () => {
      service.setLanguage('en-US');
      expect(service.language()).toBe('en-US');
    });

    it('deve salvar language no localStorage', () => {
      service.setLanguage('en-US');
      expect(localStorage.getItem(STORAGE_KEY_LANG)).toBe('en-US');
    });

    it('deve lidar com erro ao salvar no localStorage', () => {
      const setItemOriginal = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => { throw new Error('erro'); });
      expect(() => service.setLanguage('en-US')).not.toThrow();
      Storage.prototype.setItem = setItemOriginal;
    });
  });
});
