import { downloadBlobAsFile } from './FileDownloadUtils';
import { vi } from 'vitest';

describe('downloadBlobAsFile', () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    const mockAnchor = {
      href: '',
      download: '',
      click: clickSpy,
    };

    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as unknown as Node);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as unknown as Node);
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Deve criar URL do blob', () => {
    const blob = new Blob(['teste'], { type: 'text/plain' });
    downloadBlobAsFile(blob, 'arquivo.txt');

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
  });

  it('Deve configurar href com URL do blob', () => {
    const blob = new Blob(['teste'], { type: 'text/plain' });
    downloadBlobAsFile(blob, 'arquivo.txt');

    const anchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(anchor.href).toBe('blob:mock-url');
  });

  it('Deve configurar download com nome do arquivo', () => {
    const blob = new Blob(['teste'], { type: 'text/plain' });
    downloadBlobAsFile(blob, 'arquivo.txt');

    const anchor = (document.createElement as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(anchor.download).toBe('arquivo.txt');
  });

  it('Deve adicionar anchor ao body', () => {
    const blob = new Blob(['teste'], { type: 'text/plain' });
    downloadBlobAsFile(blob, 'arquivo.txt');

    expect(appendChildSpy).toHaveBeenCalled();
  });

  it('Deve clicar no anchor', () => {
    const blob = new Blob(['teste'], { type: 'text/plain' });
    downloadBlobAsFile(blob, 'arquivo.txt');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('Deve remover anchor do body', () => {
    const blob = new Blob(['teste'], { type: 'text/plain' });
    downloadBlobAsFile(blob, 'arquivo.txt');

    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('Deve revogar URL do blob', () => {
    const blob = new Blob(['teste'], { type: 'text/plain' });
    downloadBlobAsFile(blob, 'arquivo.txt');

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
