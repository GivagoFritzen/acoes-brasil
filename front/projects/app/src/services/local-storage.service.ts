import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AcaoCurrentInfo } from '../models';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly storageKey = 'acao-current-info';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) { }

  private get canUseLocalStorage(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }

  getAll(): AcaoCurrentInfo[] {
    if (!this.canUseLocalStorage) {
      return [];
    }

    const rawValue = localStorage.getItem(this.storageKey);

    if (!rawValue) {
      return [];
    }

    try {
      return JSON.parse(rawValue) as AcaoCurrentInfo[];
    } catch {
      return [];
    }
  }

  save(item: AcaoCurrentInfo): void {
    if (!this.canUseLocalStorage) {
      return;
    }

    const currentItems = this.getAll();
    const index = currentItems.findIndex((existing) => existing.codigo === item.codigo);

    if (index >= 0) {
      currentItems[index] = item;
    } else {
      currentItems.push(item);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(currentItems));
  }

  removeByCodigo(codigo: string): void {
    if (!this.canUseLocalStorage) {
      return;
    }

    const normalizedCodigo = codigo.trim().toUpperCase();
    const remainingItems = this.getAll().filter(
      (item) => item.codigo !== normalizedCodigo
    );

    localStorage.setItem(this.storageKey, JSON.stringify(remainingItems));
  }
}