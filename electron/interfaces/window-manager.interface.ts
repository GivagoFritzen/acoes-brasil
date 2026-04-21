import { BrowserWindow } from 'electron';

export interface IWindowManager {
  createWindow(): Promise<BrowserWindow>;
  loadRenderer(window: BrowserWindow): Promise<void>;
  closeWindow(): void;
  getMainWindow(): BrowserWindow | null;
}
