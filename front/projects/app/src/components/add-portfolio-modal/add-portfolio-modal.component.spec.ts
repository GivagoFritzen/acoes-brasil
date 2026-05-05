import { TestBed } from '@angular/core/testing';
import { AddPortfolioModalComponent } from './add-portfolio-modal.component';

describe('AddPortfolioModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AddPortfolioModalComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AddPortfolioModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
