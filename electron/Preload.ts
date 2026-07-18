import { contextBridge } from 'electron';
import { ElectronAPI } from './interfaces/ElectronAPI';

const electronAPI: ElectronAPI = {
  ping(): string {
    return 'pong';
  },
};

contextBridge.exposeInMainWorld('api', electronAPI);