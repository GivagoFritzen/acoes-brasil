import { contextBridge } from 'electron';
import { ElectronAPI } from './interfaces/ElectronAPI';

const electronAPI: ElectronAPI = {};

contextBridge.exposeInMainWorld('api', electronAPI);