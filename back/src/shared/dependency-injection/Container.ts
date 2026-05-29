export class Container {
  private static services = new Map<string, any>();
  private static factories = new Map<string, () => any>();

  static register<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  static get<T>(key: string): T {
    if (this.services.has(key)) {
      return this.services.get(key);
    }

    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }

    const instance = factory();
    this.services.set(key, instance);
    return instance;
  }

  static clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}
