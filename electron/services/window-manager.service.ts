import { BrowserWindow, app } from 'electron';
import { IWindowManager } from '../interfaces/window-manager.interface';
import { IErrorHandler } from '../interfaces/error-handler.interface';
import path from 'path';
import { AppConfig } from '../interfaces/app-config.interface';

export class WindowManagerService implements IWindowManager {
  private mainWindow: BrowserWindow | null = null;
  private config: AppConfig;

  constructor(
    config: AppConfig,
    private errorHandler: IErrorHandler
  ) {
    this.config = config;
  }

  async createWindow(): Promise<BrowserWindow> {
    if (this.mainWindow) {
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      width: this.config.window.width,
      height: this.config.window.height,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    await this.loadRenderer(this.mainWindow);

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  async loadRenderer(window: BrowserWindow): Promise<void> {
    if (!app.isPackaged) {
      await this.loadDevelopmentRenderer(window);
      return;
    }

    await this.loadProductionRenderer(window);
  }

  closeWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  private async loadDevelopmentRenderer(window: BrowserWindow): Promise<void> {
    const { devUrl, connectionAttempts, retryDelay } = this.config.renderer;

    for (let attempt = 1; attempt <= connectionAttempts; attempt++) {
      try {
        await window.loadURL(devUrl);
        return;
      } catch (error) {
        if (attempt === connectionAttempts) {
          const errorMessage = `Failed to connect to frontend at ${devUrl} after ${connectionAttempts} attempts`;
          this.errorHandler.handleError(error as Error, errorMessage);
          throw new Error(errorMessage);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  private async loadProductionRenderer(window: BrowserWindow): Promise<void> {
    try {
      await window.loadFile(this.config.renderer.prodIndexPath);
    } catch (error) {
      const errorMessage = `Failed to load production renderer from ${this.config.renderer.prodIndexPath}`;
      this.errorHandler.handleError(error as Error, errorMessage);
      throw new Error(errorMessage);
    }
  }
}
