import { TestBed } from '@angular/core/testing';
import { ActionButtonComponent } from './action-button.component';

describe('ActionButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActionButtonComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(ActionButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
