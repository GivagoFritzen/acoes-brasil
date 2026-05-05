import { TestBed } from '@angular/core/testing';
import { AddOrderModalComponent } from './add-order-modal.component';

describe('AddOrderModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AddOrderModalComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AddOrderModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
