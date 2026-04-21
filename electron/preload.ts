import { contextBridge } from 'electron';
import { ElectronAPI } from './types/preload.types';

const electronAPI: ElectronAPI = {
  ping(): string {
    return 'pong';
  },
};

contextBridge.exposeInMainWorld('api', electronAPI);