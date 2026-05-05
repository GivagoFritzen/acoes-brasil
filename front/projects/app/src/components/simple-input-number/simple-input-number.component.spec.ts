import { TestBed } from '@angular/core/testing';
import { SimpleInputNumberComponent } from './simple-input-number.component';

describe('SimpleInputNumberComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SimpleInputNumberComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(SimpleInputNumberComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
