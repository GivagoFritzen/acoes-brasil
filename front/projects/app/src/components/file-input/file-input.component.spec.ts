import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { FileInputComponent } from './file-input.component';
import { TranslationService } from '../../services/translation.service';

describe('FileInputComponent', () => {
    let component: FileInputComponent;
    let fixture: ComponentFixture<FileInputComponent>;
    let mockTranslationService: any;

    beforeEach(async () => {
        mockTranslationService = {
            get: vi.fn((key: string) => {
                const translations: Record<string, string> = {
                    'fileInput.dragDrop': 'Arraste o arquivo aqui',
                    'fileInput.dropToSelect': 'Solte para selecionar',
                    'fileInput.fileReady': 'Arquivo pronto',
                    'fileInput.fileSelected': 'Arquivo selecionado',
                    'fileInput.invalidFileType': 'Tipo de arquivo inválido',
                    'fileInput.couldNotIdentify': 'Não foi possível identificar o arquivo'
                };
                return translations[key] || key;
            })
        };

        await TestBed.configureTestingModule({
            imports: [FileInputComponent],
            providers: [
                { provide: TranslationService, useValue: mockTranslationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FileInputComponent);
        component = fixture.componentInstance;

        const mockInput = document.createElement('input');
        mockInput.type = 'file';
        component.desktopInput = { nativeElement: mockInput } as any;
    });

    describe('Criação', () => {
        it('deve criar componente', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('Inputs', () => {
        describe('label', () => {
            it('deve usar label padrão Arquivo', () => {
                fixture.detectChanges();
                expect(component.label).toBe('Arquivo');
            });

            it('deve aplicar label fornecido', () => {
                component.label = 'Novo Arquivo';
                fixture.detectChanges();
                expect(component.label).toBe('Novo Arquivo');
            });

            it('deve renderizar label no template', () => {
                component.label = 'Teste';
                fixture.detectChanges();
                const label = fixture.debugElement.query(By.css('.file-input__label')).nativeElement;
                expect(label.textContent.trim()).toBe('Teste');
            });
        });

        describe('placeholder', () => {
            it('deve usar placeholder padrão Nenhum arquivo selecionado', () => {
                fixture.detectChanges();
                expect(component.placeholder).toBe('Nenhum arquivo selecionado');
            });
        });

        describe('buttonText', () => {
            it('deve usar buttonText padrão Selecionar arquivo', () => {
                fixture.detectChanges();
                expect(component.buttonText).toBe('Selecionar arquivo');
            });
        });

        describe('fileName', () => {
            it('deve usar fileName padrão vazio', () => {
                fixture.detectChanges();
                expect(component.fileName).toBe('');
            });

            it('deve renderizar fileName ou placeholder no template', () => {
                component.fileName = 'meu-arquivo.txt';
                fixture.detectChanges();
                const nameElement = fixture.debugElement.query(By.css('.file-input__name')).nativeElement;
                expect(nameElement.textContent.trim()).toBe('meu-arquivo.txt');
            });
        });

        describe('accept', () => {
            it('deve usar accept padrão *', () => {
                fixture.detectChanges();
                expect(component.accept).toBe('*');
            });
        });

        describe('disabled', () => {
            it('deve usar disabled = false como padrão', () => {
                fixture.detectChanges();
                expect(component.disabled).toBe(false);
            });

            it('deve aplicar classe is-disabled quando disabled = true', () => {
                component.disabled = true;
                fixture.detectChanges();
                const div = fixture.debugElement.query(By.css('.file-input')).nativeElement;
                expect(div.classList.contains('is-disabled')).toBe(true);
            });
        });
    });

    describe('Métodos', () => {
        describe('openFileDialog', () => {
            it('NÃO deve abrir diálogo quando disabled = true', () => {
                component.disabled = true;
                const clickSpy = vi.spyOn(component.desktopInput!.nativeElement, 'click');
                component.openFileDialog();
                expect(clickSpy).not.toHaveBeenCalled();
            });

            it('deve abrir diálogo quando disabled = false', () => {
                component.disabled = false;
                const clickSpy = vi.spyOn(component.desktopInput!.nativeElement, 'click');
                component.openFileDialog();
                expect(clickSpy).toHaveBeenCalled();
            });
        });

        describe('handleFileChange', () => {
            it('deve validar arquivo aceito em handleFileChange()', () => {
                const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                const emitSpy = vi.spyOn(component.fileSelected, 'emit');
                const event = { target: { files: [file] } } as any;
                component.accept = '.pdf';
                component.handleFileChange(event);
                expect(emitSpy).toHaveBeenCalledWith(file);
            });

            it('NÃO deve aceitar arquivo não aceito em handleFileChange()', () => {
                const file = new File(['content'], 'test.txt', { type: 'text/plain' });
                const emitSpy = vi.spyOn(component.fileSelected, 'emit');
                const event = { target: { files: [file] } } as any;
                component.accept = '.pdf';
                component.handleFileChange(event);
                expect(emitSpy).toHaveBeenCalledWith(null);
            });

            it('deve mostrar success feedback após selecionar arquivo', () => {
                const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                const event = { target: { files: [file] } } as any;
                component.handleFileChange(event);
                expect(component.isDropSuccess).toBe(true);
            });

            it('deve mostrar error feedback para tipo inválido', () => {
                const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
                const event = { target: { files: [file] } } as any;
                component.accept = '.pdf';
                component.handleFileChange(event);
                expect(component.isDropError).toBe(true);
            });
        });

        describe('isFileAccepted', () => {
            it('deve validar isFileAccepted() para accept *', () => {
                component.accept = '*';
                const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                expect(component['isFileAccepted'](file)).toBe(true);
            });

            it('deve validar isFileAccepted() para extensão específica', () => {
                component.accept = '.pdf';
                const filePdf = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                const fileTxt = new File(['content'], 'test.txt', { type: 'text/plain' });
                expect(component['isFileAccepted'](filePdf)).toBe(true);
                expect(component['isFileAccepted'](fileTxt)).toBe(false);
            });

            it('deve validar isFileAccepted() para múltiplas extensões', () => {
                component.accept = '.pdf,.txt';
                const filePdf = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                const fileTxt = new File(['content'], 'test.txt', { type: 'text/plain' });
                const fileExe = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
                expect(component['isFileAccepted'](filePdf)).toBe(true);
                expect(component['isFileAccepted'](fileTxt)).toBe(true);
                expect(component['isFileAccepted'](fileExe)).toBe(false);
            });
        });

        describe('Drag Events', () => {
            const createDragEvent = (type: string, dataTransferFiles?: File[]): DragEvent => {
                const event = new Event(type) as DragEvent;
                Object.defineProperty(event, 'dataTransfer', {
                    value: dataTransferFiles ? { files: dataTransferFiles } : null,
                    writable: true
                });
                return event;
            };

            it('deve definir isDragActive true no dragover quando disabled = false', () => {
                component.disabled = false;
                component.isDragActive = false;
                const event = createDragEvent('dragover');
                const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
                component.handleDragOver(event);
                expect(preventDefaultSpy).toHaveBeenCalled();
                expect(component.isDragActive).toBe(true);
            });

            it('NÃO deve alterar estado no dragover quando disabled = true', () => {
                component.disabled = true;
                component.isDragActive = false;
                const event = createDragEvent('dragover');
                component.handleDragOver(event);
                expect(component.isDragActive).toBe(false);
            });

            it('deve manter isDragActive true após múltiplos dragenter (dragCounter)', () => {
                component.disabled = false;
                component.isDragActive = false;
                const event1 = createDragEvent('dragenter');
                const event2 = createDragEvent('dragenter');
                component.handleDragEnter(event1);
                component.handleDragEnter(event2);
                expect(component.isDragActive).toBe(true);
            });

            it('deve manter isDragActive true após dragleave com dragCounter > 0', () => {
                component.disabled = false;
                component.isDragActive = true;
                component.fileName = 'test.pdf';
                const eventEnter1 = createDragEvent('dragenter');
                const eventEnter2 = createDragEvent('dragenter');
                const eventLeave = createDragEvent('dragleave');
                component.handleDragEnter(eventEnter1);
                component.handleDragEnter(eventEnter2);
                component.handleDragLeave(eventLeave);
                expect(component.isDragActive).toBe(true);
            });

            it('deve fechar isDragActive após último dragleave (dragCounter = 0)', () => {
                component.disabled = false;
                component.isDragActive = true;
                component.fileName = '';
                const eventEnter = createDragEvent('dragenter');
                const eventLeave = createDragEvent('dragleave');
                component.handleDragEnter(eventEnter);
                component.handleDragLeave(eventLeave);
                expect(component.isDragActive).toBe(false);
            });

            it('deve processar drop de arquivo válido', () => {
                const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                component.disabled = false;
                component.isDragActive = true;
                const event = createDragEvent('drop', [file]);
                const emitSpy = vi.spyOn(component.fileSelected, 'emit');
                component.handleDrop(event);
                expect(component.isDragActive).toBe(false);
                expect(emitSpy).toHaveBeenCalledWith(file);
            });

            it('NÃO deve processar drop quando disabled = true', () => {
                const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                component.disabled = true;
                component.isDragActive = false;
                const event = createDragEvent('drop', [file]);
                const emitSpy = vi.spyOn(component.fileSelected, 'emit');
                component.handleDrop(event);
                expect(emitSpy).not.toHaveBeenCalled();
            });

            it('deve mostrar erro quando drop sem arquivo', () => {
                component.disabled = false;
                const event = createDragEvent('drop', []);
                component.handleDrop(event);
                expect(component.isDropError).toBe(true);
            });
        });

        describe('handleFileChange com arquivo null', () => {
            it('deve emitir fileSelected null quando nenhum arquivo selecionado', () => {
                const event = { target: { files: [] } } as any;
                const emitSpy = vi.spyOn(component.fileSelected, 'emit');
                component.handleFileChange(event);
                expect(emitSpy).toHaveBeenCalledWith(null);
            });

            it('deve emitir fileSelected null com event.target.files = null', () => {
                const event = { target: { files: null } } as any;
                const emitSpy = vi.spyOn(component.fileSelected, 'emit');
                component.handleFileChange(event);
                expect(emitSpy).toHaveBeenCalledWith(null);
            });
        });

        describe('isFileAccepted com MIME types', () => {
            it('deve validar image/*', () => {
                component.accept = 'image/*';
                const fileJpg = new File([''], 'test.jpg', { type: 'image/jpeg' });
                const filePng = new File([''], 'test.png', { type: 'image/png' });
                const fileTxt = new File([''], 'test.txt', { type: 'text/plain' });
                expect(component['isFileAccepted'](fileJpg)).toBe(true);
                expect(component['isFileAccepted'](filePng)).toBe(true);
                expect(component['isFileAccepted'](fileTxt)).toBe(false);
            });

            it('deve validar MIME type exato', () => {
                component.accept = 'application/pdf';
                const filePdf = new File([''], 'test.pdf', { type: 'application/pdf' });
                const fileTxt = new File([''], 'test.txt', { type: 'text/plain' });
                expect(component['isFileAccepted'](filePdf)).toBe(true);
                expect(component['isFileAccepted'](fileTxt)).toBe(false);
            });

            it('deve aceitar arquivo quando accept vazio', () => {
                component.accept = '';
                const file = new File([''], 'test.any', { type: 'anything' });
                expect(component['isFileAccepted'](file)).toBe(true);
            });

            it('deve aceitar arquivo quando accept com espaços', () => {
                component.accept = ' .pdf , .jpg ';
                const filePdf = new File([''], 'test.pdf', { type: 'application/pdf' });
                const fileJpg = new File([''], 'test.jpg', { type: 'image/jpeg' });
                const fileTxt = new File([''], 'test.txt', { type: 'text/plain' });
                expect(component['isFileAccepted'](filePdf)).toBe(true);
                expect(component['isFileAccepted'](fileJpg)).toBe(true);
                expect(component['isFileAccepted'](fileTxt)).toBe(false);
            });
        });

        describe('ngOnDestroy', () => {
            it('deve limpar timeouts no ngOnDestroy()', () => {
                vi.useFakeTimers();
                component['successTimeoutId'] = setTimeout(() => {}, 1000) as any;
                component['errorTimeoutId'] = setTimeout(() => {}, 1000) as any;
                const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
                component.ngOnDestroy();
                expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);
                vi.useRealTimers();
            });
        });
    });

    describe('Renderização', () => {
        it('deve renderizar feedback message inicial', () => {
            fixture.detectChanges();
            const feedback = fixture.debugElement.query(By.css('.file-input__feedback')).nativeElement;
            expect(feedback.textContent.trim()).toBe('Arraste o arquivo aqui');
        });

        it('deve mostrar success feedback com classe is-drop-success', () => {
            component.isDropSuccess = true;
            fixture.detectChanges();
            const desktop = fixture.debugElement.query(By.css('.file-input__desktop')).nativeElement;
            expect(desktop.classList.contains('is-drop-success')).toBe(true);
        });

        it('deve mostrar error feedback com classe is-drop-error', () => {
            component.isDropError = true;
            fixture.detectChanges();
            const desktop = fixture.debugElement.query(By.css('.file-input__desktop')).nativeElement;
            expect(desktop.classList.contains('is-drop-error')).toBe(true);
        });
    });
});
