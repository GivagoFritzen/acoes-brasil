export interface TooltipState {
  spotlight: { top: number; left: number; width: number; height: number };
  card: { top: number; left: number };
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
