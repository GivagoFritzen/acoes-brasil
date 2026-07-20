declare global {
  interface Window {
    api: import("../interfaces/ElectronAPI").ElectronAPI;
  }
}

export {};