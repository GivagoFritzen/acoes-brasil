import { TestBed } from '@angular/core/testing';
import { SimpleButtonComponent } from './simple-button.component';

describe('SimpleButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SimpleButtonComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(SimpleButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
