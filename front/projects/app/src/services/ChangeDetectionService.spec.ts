import { ChangeDetectionService } from './ChangeDetectionService';

describe('ChangeDetectionService', () => {
  let service: ChangeDetectionService;

  beforeEach(() => {
    service = new ChangeDetectionService();
  });

  describe('triggerChangeDetection', () => {
    it('deve emitir evento ao acionar triggerChangeDetection', () => {
      let emitted = false;
      service.changeDetection.subscribe(() => {
        emitted = true;
      });

      service.triggerChangeDetection();

      expect(emitted).toBe(true);
    });

    it('deve emitir múltiplos eventos em múltiplas chamadas', () => {
      const emissions: number[] = [];
      service.changeDetection.subscribe(() => {
        emissions.push(Date.now());
      });

      service.triggerChangeDetection();
      service.triggerChangeDetection();
      service.triggerChangeDetection();

      expect(emissions.length).toBe(3);
    });

    it('deve emitir eventos independentes para múltiplos subscribers', () => {
      const emissions1: number[] = [];
      const emissions2: number[] = [];

      service.changeDetection.subscribe(() => emissions1.push(1));
      service.changeDetection.subscribe(() => emissions2.push(2));

      service.triggerChangeDetection();

      expect(emissions1.length).toBe(1);
      expect(emissions2.length).toBe(1);
    });
  });

  describe('changeDetection', () => {
    it('deve retornar um Observable', () => {
      const observable = service.changeDetection;
      expect(observable).toBeDefined();
      expect(typeof observable.subscribe).toBe('function');
    });

    it('deve permitir subscribe e unsubscribe', () => {
      let emitted = false;
      const subscription = service.changeDetection.subscribe(() => {
        emitted = true;
      });

      service.triggerChangeDetection();
      subscription.unsubscribe();

      expect(emitted).toBe(true);
    });
  });
});
