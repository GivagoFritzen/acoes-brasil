import { Injectable, signal } from '@angular/core';

export interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  private readonly DEFAULT_LIMIT = 10;

  readonly page = signal(1);
  readonly limit = signal(this.DEFAULT_LIMIT);
  readonly totalPages = signal(1);

  getState(): PaginationState {
    return {
      page: this.page(),
      limit: this.limit(),
      totalPages: this.totalPages()
    };
  }

  updatePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page.set(newPage);
    }
  }

  updateLimit(newLimit: number): void {
    if (newLimit > 0) {
      this.limit.set(newLimit);
      this.page.set(1);
    }
  }

  updateTotalPages(totalPages: number): void {
    if (totalPages >= 0) {
      this.totalPages.set(totalPages);
      if (this.page() > totalPages && totalPages > 0) {
        this.page.set(totalPages);
      }
    }
  }

  nextPage(): boolean {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      return true;
    }
    return false;
  }

  previousPage(): boolean {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      return true;
    }
    return false;
  }

  reset(): void {
    this.page.set(1);
    this.limit.set(this.DEFAULT_LIMIT);
    this.totalPages.set(1);
  }

  canGoNext(): boolean {
    return this.page() < this.totalPages();
  }

  canGoPrevious(): boolean {
    return this.page() > 1;
  }
}
