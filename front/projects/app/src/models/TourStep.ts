export interface TourStep {
  route: string;
  titleKey: string;
  descKey: string;
  elementSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
