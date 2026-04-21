import path from 'path';
import { AppConfig } from '../interfaces/app-config.interface';

export const createAppConfig = (projectRoot: string, userDataPath: string): AppConfig => ({
  window: {
    width: 1200,
    height: 800,
  },
  renderer: {
    devUrl: 'http://localhost:4200',
    prodIndexPath: `${projectRoot}/front/dist/app/browser/index.html`,
    connectionAttempts: 30,
    retryDelay: 1000,
  },
  backend: {
    entryPath: `${projectRoot}/back/dist/index.js`,
    defaultPort: '3000',
    dbDialect: 'sqlite',
    dbStoragePath: path.join(userDataPath, 'data', 'app.sqlite'),
  },
});
