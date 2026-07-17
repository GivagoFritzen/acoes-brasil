import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../services/SettingsService';
import { CustomizeComponent } from './CustomizeComponent';

describe('CustomizeComponent', () => {
  let component: CustomizeComponent;
  let settingsService: SettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomizeComponent],
      providers: [
        SettingsService,
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CustomizeComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
    fixture.detectChanges();
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar settingsService.toggleModule ao alternar wallet', () => {
    const toggleSpy = vi.spyOn(settingsService, 'toggleModule');
    component.toggleModule('wallet');
    expect(toggleSpy).toHaveBeenCalledWith('wallet');
  });

  it('deve chamar settingsService.toggleModule ao alternar composition', () => {
    const toggleSpy = vi.spyOn(settingsService, 'toggleModule');
    component.toggleModule('composition');
    expect(toggleSpy).toHaveBeenCalledWith('composition');
  });

  it('deve chamar settingsService.toggleModule ao alternar profitability', () => {
    const toggleSpy = vi.spyOn(settingsService, 'toggleModule');
    component.toggleModule('profitability');
    expect(toggleSpy).toHaveBeenCalledWith('profitability');
  });
});
