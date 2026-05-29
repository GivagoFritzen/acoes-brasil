import { contextBridge } from 'electron';
import { ElectronAPI } from './types/PreloadTypes';

const electronAPI: ElectronAPI = {
  ping(): string {
    return 'pong';
  },
};

contextBridge.exposeInMainWorld('api', electronAPI);