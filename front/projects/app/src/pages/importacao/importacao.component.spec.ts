import { TestBed } from '@angular/core/testing';
import { ImportacaoComponent } from './importacao.component';

describe('ImportacaoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ImportacaoComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(ImportacaoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
