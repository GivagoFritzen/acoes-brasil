import { TestBed } from '@angular/core/testing';
import { SimpleInputComponent } from './simple-input.component';

describe('SimpleInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SimpleInputComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(SimpleInputComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
