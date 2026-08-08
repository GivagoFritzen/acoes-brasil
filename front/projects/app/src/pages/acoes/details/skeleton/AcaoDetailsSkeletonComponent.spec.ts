import { TestBed } from '@angular/core/testing';
import { AcaoDetailsSkeletonComponent } from './AcaoDetailsSkeletonComponent';

describe('AcaoDetailsSkeletonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcaoDetailsSkeletonComponent],
    }).compileComponents();
  });

  it('deve criar componente', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('deve renderizar container principal do skeleton', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    fixture.detectChanges();

    const elemento = fixture.nativeElement.querySelector('.acao-details-skeleton');
    expect(elemento).toBeTruthy();
  });

  it('deve renderizar header do skeleton', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.acao-details-skeleton__header');
    expect(header).toBeTruthy();
  });

  it('deve renderizar grid de cards do skeleton', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.acao-details-skeleton__grid');
    expect(grid).toBeTruthy();
  });

  it('deve renderizar 5 cards no skeleton', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.acao-details-skeleton__card');
    expect(cards.length).toBe(5);
  });

  it('deve renderizar elementos shimmer', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    fixture.detectChanges();

    const shimmerElements = fixture.nativeElement.querySelectorAll('.skeleton');
    expect(shimmerElements.length).toBeGreaterThan(0);
  });

  it('deve conter card de grafico', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    fixture.detectChanges();

    const chartCard = fixture.nativeElement.querySelector('.acao-details-skeleton__card--chart');
    expect(chartCard).toBeTruthy();
  });

  it('deve conter card de proventos', () => {
    const fixture = TestBed.createComponent(AcaoDetailsSkeletonComponent);
    fixture.detectChanges();

    const proventosCard = fixture.nativeElement.querySelector('.acao-details-skeleton__card--proventos');
    expect(proventosCard).toBeTruthy();
  });
});
