import { app, BrowserWindow } from 'electron';
import { IAppLifecycle } from '../interfaces/IAppLifecycle';
import { IWindowManager } from '../interfaces/IWindowManager';
import { IBackendManager } from '../interfaces/IBackendManager';

export class AppLifecycleService implements IAppLifecycle {
  constructor(
    private windowManager: IWindowManager,
    private backendManager: IBackendManager
  ) {}

  async initialize(): Promise<void> {
    await app.whenReady();

    if (app.isPackaged) {
      await this.backendManager.startBackend();
    }

    await this.windowManager.createWindow();

    this.setupAppEventHandlers();
  }

  shutdown(): void {
    this.backendManager.stopBackend();
    
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private setupAppEventHandlers(): void {
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.windowManager.createWindow();
      }
    });

    app.on('window-all-closed', () => {
      this.shutdown();
    });

    app.on('before-quit', () => {
      this.backendManager.stopBackend();
    });
  }
}
