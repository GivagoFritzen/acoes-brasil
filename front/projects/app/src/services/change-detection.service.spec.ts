import { ChangeDetectionService } from './change-detection.service';

describe('ChangeDetectionService', () => {
  let service: ChangeDetectionService;

  beforeEach(() => {
    service = new ChangeDetectionService();
  });

  it('deve emitir evento ao acionar triggerChangeDetection', () => {
    let emitted = false;
    service.changeDetection.subscribe(() => {
      emitted = true;
    });

    service.triggerChangeDetection();

    expect(emitted).toBe(true);
  });
});
