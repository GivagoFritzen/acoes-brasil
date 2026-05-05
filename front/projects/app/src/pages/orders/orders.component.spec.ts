import { TestBed } from '@angular/core/testing';
import { OrdersComponent } from './orders.component';

describe('OrdersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OrdersComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(OrdersComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
