import { TestBed } from '@angular/core/testing';
import { ExportacaoComponent } from './exportacao.component';

describe('ExportacaoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ExportacaoComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(ExportacaoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
