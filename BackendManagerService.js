"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendManagerService = void 0;
const child_process_1 = require("child_process");
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BackendManagerService {
    constructor(config, errorHandler) {
        this.errorHandler = errorHandler;
        this.backendProcess = null;
        this.config = config;
    }
    async startBackend() {
        if (this.backendProcess) {
            return;
        }
        try {
            this.ensureDataDirectory();
            this.backendProcess = this.spawnBackendProcess();
            this.setupProcessHandlers();
            await this.waitForBackend();
        }
        catch (error) {
            this.errorHandler.handleError(error, 'Failed to start backend');
        }
    }
    stopBackend() {
        if (this.backendProcess) {
            this.backendProcess.kill();
            this.backendProcess = null;
        }
    }
    isRunning() {
        return this.backendProcess !== null && !this.backendProcess.killed;
    }
    ensureDataDirectory() {
        const dbPath = this.config.backend.dbStoragePath;
        const dbDir = path_1.default.dirname(dbPath);
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
    }
    spawnBackendProcess() {
        const { entryPath, defaultPort, dbDialect, dbStoragePath } = this.config.backend;
        const backendDir = path_1.default.dirname(entryPath);
        const cwd = path_1.default.resolve(backendDir, '..', '..', '..', '..');
        const backendEnv = {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            DB_DIALECT: dbDialect,
            DB_STORAGE: dbStoragePath,
            PORT: defaultPort,
            SERVE_STATIC: 'true',
        };
        return (0, child_process_1.spawn)(process.execPath, [entryPath], {
            cwd,
            env: backendEnv,
            stdio: 'inherit',
            shell: false,
        });
    }
    waitForBackend() {
        return new Promise((resolve, reject) => {
            const maxAttempts = 20;
            const delayMs = 500;
            let attempts = 0;
            const check = () => {
                attempts++;
                const req = http_1.default.get(`http://localhost:${this.config.backend.defaultPort}/health`, (res) => {
                    if (res.statusCode === 200) {
                        resolve();
                    }
                    else if (attempts < maxAttempts) {
                        setTimeout(check, delayMs);
                    }
                    else {
                        reject(new Error(`Backend não respondeu após ${maxAttempts} tentativas`));
                    }
                });
                req.on('error', () => {
                    if (attempts < maxAttempts) {
                        setTimeout(check, delayMs);
                    }
                    else {
                        reject(new Error(`Backend não iniciou após ${maxAttempts} tentativas`));
                    }
                });
                req.end();
            };
            check();
        });
    }
    setupProcessHandlers() {
        if (!this.backendProcess)
            return;
        this.backendProcess.on('error', (error) => {
            this.errorHandler.handleError(error, 'Backend process error');
        });
        this.backendProcess.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                this.errorHandler.handleError(new Error(`Backend process exited with code ${code}`), 'Backend process exited unexpectedly');
            }
            this.backendProcess = null;
        });
    }
}
exports.BackendManagerService = BackendManagerService;
//# sourceMappingURL=BackendManagerService.js.map