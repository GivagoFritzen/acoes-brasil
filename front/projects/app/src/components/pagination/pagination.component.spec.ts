import { TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
