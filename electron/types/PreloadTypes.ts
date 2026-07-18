export interface ElectronAPI {
  ping(): string;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
