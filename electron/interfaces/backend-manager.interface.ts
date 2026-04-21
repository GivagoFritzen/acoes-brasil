export interface IBackendManager {
  startBackend(): Promise<void>;
  stopBackend(): void;
  isRunning(): boolean;
}
