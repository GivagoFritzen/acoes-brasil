import { TestBed } from '@angular/core/testing';
import { HelpTipComponent } from './help-tip.component';

describe('HelpTipComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HelpTipComponent] }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(HelpTipComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
