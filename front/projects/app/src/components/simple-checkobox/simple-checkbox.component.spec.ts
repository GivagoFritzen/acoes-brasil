import { TestBed } from '@angular/core/testing';
import { SimpleCheckboxComponent } from './simple-checkbox.component';

describe('SimpleCheckboxComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SimpleCheckboxComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(SimpleCheckboxComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
