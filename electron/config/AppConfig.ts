import path from 'path';
import { app } from 'electron';
import { AppConfig } from '../interfaces/IAppConfig';

const getBackendRoot = (projectRoot: string): string => {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked')
    : projectRoot;
};

export const createAppConfig = (projectRoot: string, userDataPath: string): AppConfig => {
  const backendRoot = getBackendRoot(projectRoot);

  return {
    window: {
      width: 1200,
      height: 800,
    },
    renderer: {
      devUrl: 'http://localhost:4200',
      prodIndexPath: `${projectRoot}/front/dist/app/browser/index.csr.html`,
      connectionAttempts: 30,
      retryDelay: 1000,
    },
    backend: {
      entryPath: `${backendRoot}/back/dist/back/src/index.js`,
      defaultPort: '3000',
      dbDialect: 'sqlite',
      dbStoragePath: path.join(userDataPath, 'data', 'app.sqlite'),
    },
  };
};
