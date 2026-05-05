import { TestBed } from '@angular/core/testing';
import { ProventosComponent } from './proventos.component';

describe('ProventosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProventosComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(ProventosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
