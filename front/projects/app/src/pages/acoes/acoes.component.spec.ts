import { TestBed } from '@angular/core/testing';
import { AcoesComponent } from './acoes.component';

describe('AcoesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AcoesComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AcoesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
