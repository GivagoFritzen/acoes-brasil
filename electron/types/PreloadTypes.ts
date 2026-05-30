export interface ElectronAPI {
  ping(): string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
