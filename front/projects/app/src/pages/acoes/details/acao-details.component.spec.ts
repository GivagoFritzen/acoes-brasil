import { TestBed } from '@angular/core/testing';
import { AcaoDetailsComponent } from './acao-details.component';

describe('AcaoDetailsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AcaoDetailsComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AcaoDetailsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
