import { TestBed } from '@angular/core/testing';
import { AddProventoModalComponent } from './add-provento-modal.component';

describe('AddProventoModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AddProventoModalComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AddProventoModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
