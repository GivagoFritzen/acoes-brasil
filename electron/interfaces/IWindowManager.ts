import { BrowserWindow } from 'electron';

export interface IWindowManager {
  createWindow(): Promise<BrowserWindow>;
  showLoadingScreen(): void;
  loadApp(): Promise<void>;
  loadRenderer(window: BrowserWindow): Promise<void>;
  closeWindow(): void;
  getMainWindow(): BrowserWindow | null;
}
