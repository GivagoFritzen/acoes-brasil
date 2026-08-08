import { BrowserWindow, app } from 'electron';
import { IWindowManager } from '../interfaces/IWindowManager';
import { IErrorHandler } from '../interfaces/IErrorHandler';
import path from 'path';
import { AppConfig } from '../interfaces/IAppConfig';

const LOADING_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .loader { text-align: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    p { color: #fff; font-size: 14px; }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Carregando aplicação...</p>
  </div>
</body>
</html>`;

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
        sandbox: true,
        webSecurity: app.isPackaged,
      },
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  showLoadingScreen(): void {
    if (this.mainWindow) {
      this.mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(LOADING_HTML)}`);
    }
  }

  async loadApp(): Promise<void> {
    if (!this.mainWindow) return;
    await this.loadRenderer(this.mainWindow);
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
      await window.loadURL(`http://localhost:${this.config.backend.defaultPort}`);
    } catch (error) {
      const errorMessage = `Failed to load production renderer from http://localhost:${this.config.backend.defaultPort}`;
      this.errorHandler.handleError(error as Error, errorMessage);
      throw new Error(errorMessage);
    }
  }
}
