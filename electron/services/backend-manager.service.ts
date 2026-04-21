import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { IBackendManager } from '../interfaces/backend-manager.interface';
import { IErrorHandler } from '../interfaces/error-handler.interface';
import { AppConfig } from '../interfaces/app-config.interface';

export class BackendManagerService implements IBackendManager {
  private backendProcess: ChildProcess | null = null;
  private config: AppConfig;

  constructor(
    config: AppConfig,
    private errorHandler: IErrorHandler
  ) {
    this.config = config;
  }

  async startBackend(): Promise<void> {
    if (this.backendProcess) {
      return;
    }

    try {
      this.ensureDataDirectory();
      this.backendProcess = this.spawnBackendProcess();

      this.setupProcessHandlers();
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'Failed to start backend');
      throw error;
    }
  }

  stopBackend(): void {
    if (this.backendProcess) {
      this.backendProcess.kill();
      this.backendProcess = null;
    }
  }

  isRunning(): boolean {
    return this.backendProcess !== null && !this.backendProcess.killed;
  }

  private ensureDataDirectory(): void {
    const dbPath = this.config.backend.dbStoragePath;
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  private spawnBackendProcess(): ChildProcess {
    const { entryPath, defaultPort, dbDialect, dbStoragePath } = this.config.backend;

    return spawn(process.execPath, [entryPath], {
      cwd: path.resolve(path.dirname(entryPath), '..', '..'),
      env: {
        ...process.env,
        DB_DIALECT: dbDialect,
        DB_STORAGE: dbStoragePath,
        PORT: process.env.PORT ?? defaultPort,
      },
      stdio: 'inherit',
      shell: false,
    });
  }

  private setupProcessHandlers(): void {
    if (!this.backendProcess) return;

    this.backendProcess.on('error', (error) => {
      this.errorHandler.handleError(error, 'Backend process error');
    });

    this.backendProcess.on('exit', (code) => {
      if (code !== 0) {
        this.errorHandler.handleError(
          new Error(`Backend process exited with code ${code}`),
          'Backend process exited unexpectedly'
        );
      }
      this.backendProcess = null;
    });
  }
}
