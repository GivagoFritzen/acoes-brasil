import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Subject } from 'rxjs';
import { LanguageSelectorComponent } from './LanguageSelectorComponent';
import { TranslationService } from '../../services/TranslationService';
import { ClickOutsideDirective } from '../../directives/ClickOutsideDirective';

describe('LanguageSelectorComponent', () => {
    let component: LanguageSelectorComponent;
    let fixture: ComponentFixture<LanguageSelectorComponent>;
    let mockTranslationService: any;
    let currentLangSubject: Subject<string>;

    beforeEach(async () => {
        currentLangSubject = new Subject<string>();

        mockTranslationService = {
            currentLang$: currentLangSubject.asObservable(),
            loadLanguage: vi.fn().mockResolvedValue(undefined),
            get: vi.fn(),
            has: vi.fn(),
            getCurrentLanguage: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LanguageSelectorComponent, ClickOutsideDirective],
            providers: [
                { provide: TranslationService, useValue: mockTranslationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LanguageSelectorComponent);
        component = fixture.componentInstance;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Signals (Signals)', () => {
        describe('currentLanguage', () => {
            it('deve usar currentLanguage padrão pt-BR', () => {
                fixture.detectChanges();
                expect(component.currentLanguage()).toBe('pt-BR');
            });

            it('deve atualizar currentLanguage quando currentLang$ emitir novo valor', () => {
                fixture.detectChanges();
                currentLangSubject.next('en-US');
                expect(component.currentLanguage()).toBe('en-US');
            });
        });

        describe('isDropdownOpen', () => {
            it('deve usar isDropdownOpen padrão false', () => {
                fixture.detectChanges();
                expect(component.isDropdownOpen()).toBe(false);
            });
        });
    });

    describe('Languages', () => {
        it('deve ter 2 opções de idioma', () => {
            fixture.detectChanges();
            expect(component.languages.length).toBe(2);
            expect(component.languages[0].code).toBe('pt-BR');
            expect(component.languages[0].name).toBe('Português');
            expect(component.languages[1].code).toBe('en-US');
            expect(component.languages[1].name).toBe('Inglês');
        });
    });

    describe('Métodos', () => {
        describe('toggleDropdown', () => {
            it('deve alternar isDropdownOpen quando toggleDropdown() chamado', () => {
                fixture.detectChanges();
                expect(component.isDropdownOpen()).toBe(false);
                component.toggleDropdown();
                expect(component.isDropdownOpen()).toBe(true);
                component.toggleDropdown();
                expect(component.isDropdownOpen()).toBe(false);
            });
        });

        describe('closeDropdown', () => {
            it('deve fechar dropdown quando closeDropdown() chamado', () => {
                fixture.detectChanges();
                component.isDropdownOpen.set(true);
                component.closeDropdown();
                expect(component.isDropdownOpen()).toBe(false);
            });
        });

        describe('selectLanguage', () => {
            it('deve chamar loadLanguage do TranslationService quando selectLanguage com idioma diferente', async () => {
                fixture.detectChanges();
                component.currentLanguage.set('pt-BR');
                await component.selectLanguage('en-US');
                expect(mockTranslationService.loadLanguage).toHaveBeenCalledWith('en-US');
            });

            it('NÃO deve chamar loadLanguage quando selectLanguage com mesmo idioma', async () => {
                fixture.detectChanges();
                component.currentLanguage.set('pt-BR');
                await component.selectLanguage('pt-BR');
                expect(mockTranslationService.loadLanguage).not.toHaveBeenCalled();
            });

            it('deve fechar dropdown após selecionar idioma diferente', async () => {
                fixture.detectChanges();
                component.isDropdownOpen.set(true);
                await component.selectLanguage('en-US');
                expect(component.isDropdownOpen()).toBe(false);
            });

            it('deve fechar dropdown após selecionar mesmo idioma', async () => {
                fixture.detectChanges();
                component.isDropdownOpen.set(true);
                await component.selectLanguage('pt-BR');
                expect(component.isDropdownOpen()).toBe(false);
            });
        });

        describe('getCurrentLanguageOption', () => {
            it('deve retornar opção correta quando currentLanguage é pt-BR', () => {
                fixture.detectChanges();
                component.currentLanguage.set('pt-BR');
                const option = component.getCurrentLanguageOption();
                expect(option.code).toBe('pt-BR');
                expect(option.name).toBe('Português');
            });

            it('deve retornar opção correta quando currentLanguage é en-US', () => {
                fixture.detectChanges();
                component.currentLanguage.set('en-US');
                const option = component.getCurrentLanguageOption();
                expect(option.code).toBe('en-US');
                expect(option.name).toBe('Inglês');
            });
        });

        describe('handleBlur', () => {
            it('deve fechar dropdown após 150ms no handleBlur()', () => {
                fixture.detectChanges();
                component.isDropdownOpen.set(true);
                vi.useFakeTimers();
                component.handleBlur();
                expect(component.isDropdownOpen()).toBe(true);
                vi.advanceTimersByTime(150);
                expect(component.isDropdownOpen()).toBe(false);
                vi.useRealTimers();
            });
        });
    });

    describe('Renderização', () => {
        it('deve exibir nome do idioma atual', () => {
            fixture.detectChanges();
            component.currentLanguage.set('pt-BR');
            fixture.detectChanges();
            const nameElement = fixture.debugElement.query(By.css('.language-selector__name')).nativeElement;
            expect(nameElement.textContent.trim()).toBe('Português');
        });

        it('deve aplicar classe language-selector--open quando isDropdownOpen é true', () => {
            fixture.detectChanges();
            component.isDropdownOpen.set(true);
            fixture.detectChanges();
            const selector = fixture.debugElement.query(By.css('.language-selector')).nativeElement;
            expect(selector.classList.contains('language-selector--open')).toBe(true);
        });

        it('deve renderizar opções no dropdown quando aberto', () => {
            fixture.detectChanges();
            component.isDropdownOpen.set(true);
            fixture.detectChanges();
            const options = fixture.debugElement.queryAll(By.css('.language-selector__option'));
            expect(options.length).toBe(2);
        });

        it('deve marcar opção ativa com classe language-selector__option--active', () => {
            fixture.detectChanges();
            component.currentLanguage.set('pt-BR');
            component.isDropdownOpen.set(true);
            fixture.detectChanges();
            const options = fixture.debugElement.queryAll(By.css('.language-selector__option'));
            expect(options[0].nativeElement.classList.contains('language-selector__option--active')).toBe(true);
            expect(options[1].nativeElement.classList.contains('language-selector__option--active')).toBe(false);
        });
    });

    describe('Eventos', () => {
        it('deve alternar dropdown ao clicar no botão toggle', () => {
            fixture.detectChanges();
            const toggleButton = fixture.debugElement.query(By.css('.language-selector__toggle')).nativeElement;
            toggleButton.click();
            expect(component.isDropdownOpen()).toBe(true);
            toggleButton.click();
            expect(component.isDropdownOpen()).toBe(false);
        });

        it('deve selecionar idioma ao clicar em opção do dropdown', () => {
            fixture.detectChanges();
            component.isDropdownOpen.set(true);
            fixture.detectChanges();
            const selectSpy = vi.spyOn(component, 'selectLanguage');
            const options = fixture.debugElement.queryAll(By.css('.language-selector__option'));
            options[1].nativeElement.click();
            expect(selectSpy).toHaveBeenCalledWith('en-US');
        });

        it('deve fechar dropdown ao clicar fora (clickOutside)', () => {
            fixture.detectChanges();
            component.isDropdownOpen.set(true);
            fixture.detectChanges();
            component.closeDropdown();
            expect(component.isDropdownOpen()).toBe(false);
        });
    });
});
