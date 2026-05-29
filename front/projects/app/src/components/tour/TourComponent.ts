import { Component, OnDestroy, PLATFORM_ID, inject, signal, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TourService } from '../../services/TourService';
import { TranslatePipe } from '../../pipes/TranslatePipe';

interface TooltipState {
  spotlight: { top: number; left: number; width: number; height: number };
  card: { top: number; left: number };
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './TourComponent.html',
  styleUrls: ['./TourComponent.scss'],
})
export class TourComponent implements OnDestroy {
  readonly tourService = inject(TourService);
  readonly state = signal<TooltipState | null>(null);
  private readonly platformId = inject(PLATFORM_ID);

  private pollId: number | null = null;
  private listenersAttached = false;

  constructor() {
    effect(() => {
      this.tourService.isActive();
      if (this.tourService.isActive()) {
        this.attachListeners();
        this.startPoll();
      } else {
        this.stopPoll();
        this.state.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPoll();
    this.detachListeners();
  }

  get titleKey(): string {
    return this.tourService.currentStep?.titleKey ?? '';
  }

  get descKey(): string {
    return this.tourService.currentStep?.descKey ?? '';
  }

  private attachListeners(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.listenersAttached) return;
    this.listenersAttached = true;
    window.addEventListener('scroll', this.boundReposition, true);
    window.addEventListener('resize', this.boundReposition);
  }

  private detachListeners(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.listenersAttached = false;
    window.removeEventListener('scroll', this.boundReposition, true);
    window.removeEventListener('resize', this.boundReposition);
  }

  private readonly boundReposition = () => {
    if (this.tourService.isActive()) this.reposition();
  };

  private startPoll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopPoll();
    this.reposition();
    this.pollId = window.setInterval(() => this.reposition(), 300);
  }

  private stopPoll(): void {
    if (this.pollId !== null) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
  }

  private reposition(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const step = this.tourService.currentStep;
    if (!step || !this.tourService.isActive()) {
      this.state.set(null);
      return;
    }

    if (!step.elementSelector) {
      this.state.set(null);
      return;
    }

    const el = document.querySelector(step.elementSelector) as HTMLElement | null;
    if (!el) return;

    this.stopPoll();

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 16;
    const cardW = Math.min(340, vw - 32);
    const cardH = 200;
    const rect = el.getBoundingClientRect();
    const pref = step.position === 'center' ? 'bottom' : (step.position ?? 'bottom');

    if (vw < 500) {
      this.state.set({
        spotlight: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        card: { top: 0, left: 0 },
        placement: 'center',
      });
      return;
    }

    const placements: Array<'bottom' | 'top' | 'right' | 'left'> = [
      pref,
      ...(['bottom', 'top', 'right', 'left'] as const).filter(p => p !== pref),
    ];

    const fits = (t: number, l: number) =>
      t >= 16 && t + cardH <= vh - 16 && l >= 16 && l + cardW <= vw - 16 && !(
        l < rect.right && l + cardW > rect.left && t < rect.bottom && t + cardH > rect.top
      );

    let chosen: { top: number; left: number; placement: 'bottom' | 'top' | 'right' | 'left' } | null = null;

    for (const p of placements) {
      let t = 0, l = 0;

      switch (p) {
        case 'bottom':
          t = rect.bottom + gap;
          l = rect.left + rect.width / 2 - cardW / 2;
          break;
        case 'top':
          t = rect.top - cardH - gap;
          l = rect.left + rect.width / 2 - cardW / 2;
          break;
        case 'left':
          t = rect.top + rect.height / 2 - cardH / 2;
          l = rect.left - cardW - gap;
          break;
        case 'right':
          t = rect.top + rect.height / 2 - cardH / 2;
          l = rect.right + gap;
          break;
      }

      if (fits(t, l)) {
        chosen = { top: t, left: l, placement: p };
        break;
      }
    }

    if (!chosen) {
      const ct = Math.max(16, (vh - cardH) / 2);
      const cl = Math.max(16, (vw - cardW) / 2);
      chosen = { top: ct, left: cl, placement: 'bottom' };
    }

    this.state.set({
      spotlight: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      card: { top: chosen.top, left: chosen.left },
      placement: chosen.placement,
    });
  }
}
