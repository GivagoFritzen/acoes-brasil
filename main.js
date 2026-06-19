"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const AppConfig_1 = require("./config/AppConfig");
const ErrorHandlerService_1 = require("./services/ErrorHandlerService");
const WindowManagerService_1 = require("./services/WindowManagerService");
const BackendManagerService_1 = require("./services/BackendManagerService");
const AppLifecycleService_1 = require("./services/AppLifecycleService");
class ElectronApplication {
    constructor() {
        const projectRoot = path_1.default.resolve(__dirname, '..');
        const userDataPath = electron_1.app.getPath('userData');
        this.config = (0, AppConfig_1.createAppConfig)(projectRoot, userDataPath);
        this.errorHandler = new ErrorHandlerService_1.ErrorHandlerService();
        this.windowManager = new WindowManagerService_1.WindowManagerService(this.config, this.errorHandler);
        this.backendManager = new BackendManagerService_1.BackendManagerService(this.config, this.errorHandler);
        this.appLifecycle = new AppLifecycleService_1.AppLifecycleService(this.windowManager, this.backendManager);
    }
    async start() {
        try {
            await this.appLifecycle.initialize();
        }
        catch (error) {
            this.errorHandler.handleError(error, 'Failed to start application');
            process.exit(1);
        }
    }
}
const application = new ElectronApplication();
application.start().catch((error) => {
    console.error('Critical error during application startup:', error);
    process.exit(1);
});
//# sourceMappingURL=Main.js.map