import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './AppComponent';
import { TourService } from '../services/TourService';

describe('App', () => {
  const tourServiceMock = {
    wasShown: true,
    start: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TourService, useValue: tourServiceMock },
      ],
    }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('deve iniciar tour quando nao foi mostrado', () => {
    tourServiceMock.wasShown = false;
    tourServiceMock.start.mockClear();

    TestBed.createComponent(App).componentInstance.ngOnInit();

    expect(tourServiceMock.start).toHaveBeenCalled();
  });

  it('nao deve iniciar tour quando ja foi mostrado', () => {
    tourServiceMock.wasShown = true;
    tourServiceMock.start.mockClear();

    TestBed.createComponent(App).componentInstance.ngOnInit();

    expect(tourServiceMock.start).not.toHaveBeenCalled();
  });
});
