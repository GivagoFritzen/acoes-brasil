import { TestBed } from '@angular/core/testing';
import { SimpleSelectComponent } from './simple-select.component';

describe('SimpleSelectComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SimpleSelectComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(SimpleSelectComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
