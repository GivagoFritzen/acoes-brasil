import { TestBed } from '@angular/core/testing';
import { AlertsComponent } from './alerts.component';

describe('AlertsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
    }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
