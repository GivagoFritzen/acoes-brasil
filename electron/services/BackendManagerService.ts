import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { IBackendManager } from '../interfaces/IBackendManager';
import { IErrorHandler } from '../interfaces/IErrorHandler';
import { AppConfig } from '../interfaces/IAppConfig';

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
      await this.waitForBackend();
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'Failed to start backend');
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
    const backendDir = path.dirname(entryPath);
    const cwd = path.resolve(backendDir, '..', '..', '..', '..');

    const backendEnv: Record<string, string | undefined> = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      DB_DIALECT: dbDialect,
      DB_STORAGE: dbStoragePath,
      PORT: defaultPort,
      SERVE_STATIC: 'true',
    };

    return spawn(process.execPath, [entryPath], {
      cwd,
      env: backendEnv,
      stdio: 'inherit',
      shell: false,
    });
  }

  private waitForBackend(): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 20;
      const delayMs = 500;
      let attempts = 0;

      const check = () => {
        attempts++;
        const req = http.get(`http://localhost:${this.config.backend.defaultPort}/health`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else if (attempts < maxAttempts) {
            setTimeout(check, delayMs);
          } else {
            reject(new Error(`Backend não respondeu após ${maxAttempts} tentativas`));
          }
        });

        req.on('error', () => {
          if (attempts < maxAttempts) {
            setTimeout(check, delayMs);
          } else {
            reject(new Error(`Backend não iniciou após ${maxAttempts} tentativas`));
          }
        });

        req.end();
      };

      check();
    });
  }

  private setupProcessHandlers(): void {
    if (!this.backendProcess) return;

    this.backendProcess.on('error', (error) => {
      this.errorHandler.handleError(error, 'Backend process error');
    });

    this.backendProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        this.errorHandler.handleError(
          new Error(`Backend process exited with code ${code}`),
          'Backend process exited unexpectedly'
        );
      }
      this.backendProcess = null;
    });
  }
}
