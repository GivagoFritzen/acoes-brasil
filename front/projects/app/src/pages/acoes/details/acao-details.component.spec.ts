import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AcaoDetailsComponent } from './acao-details.component';
import { vi } from 'vitest';

describe('AcaoDetailsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcaoDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'PETR4' } },
          },
        },
      ],
    }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AcaoDetailsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
