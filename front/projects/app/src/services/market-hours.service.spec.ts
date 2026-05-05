import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MarketHoursService } from './market-hours.service';

describe('MarketHoursService', () => {
  let service: MarketHoursService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MarketHoursService],
    });

    service = TestBed.inject(MarketHoursService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar horários de mercado da BVMF', () => {
    const payload = { data: 'ok' } as any;

    service.getBvmfMarketHours().subscribe(response => {
      expect(response).toEqual(payload);
    });

    const req = httpMock.expectOne('https://markethours.io/api/markets/bvmf');
    expect(req.request.method).toBe('GET');
    req.flush(payload);
  });
});
