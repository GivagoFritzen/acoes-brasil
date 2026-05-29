export interface IAppLifecycle {
  initialize(): Promise<void>;
  shutdown(): void;
}
