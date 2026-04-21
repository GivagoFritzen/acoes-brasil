import { app } from 'electron';
import path from 'path';
import { createAppConfig } from './config/app-config';
import { ErrorHandlerService } from './services/error-handler.service';
import { WindowManagerService } from './services/window-manager.service';
import { BackendManagerService } from './services/backend-manager.service';
import { AppLifecycleService } from './services/app-lifecycle.service';
import { AppConfig } from './interfaces/app-config.interface';

class ElectronApplication {
  private config: AppConfig;
  private errorHandler: ErrorHandlerService;
  private windowManager: WindowManagerService;
  private backendManager: BackendManagerService;
  private appLifecycle: AppLifecycleService;

  constructor() {
    const projectRoot = path.resolve(__dirname, '..');
    const userDataPath = app.getPath('userData');

    this.config = createAppConfig(projectRoot, userDataPath);
    this.errorHandler = new ErrorHandlerService();
    this.windowManager = new WindowManagerService(this.config, this.errorHandler);
    this.backendManager = new BackendManagerService(this.config, this.errorHandler);
    this.appLifecycle = new AppLifecycleService(this.windowManager, this.backendManager);
  }

  async start(): Promise<void> {
    try {
      await this.appLifecycle.initialize();
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'Failed to start application');
      process.exit(1);
    }
  }
}

const application = new ElectronApplication();
application.start().catch((error) => {
  console.error('Critical error during application startup:', error);
  process.exit(1);
});