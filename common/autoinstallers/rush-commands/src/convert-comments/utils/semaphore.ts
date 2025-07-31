/**
 * semaphore concurrency control class
 */
export class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  /**
   * Get permission
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  /**
   * release permission
   */
  release(): void {
    this.permits++;
    const next = this.waiting.shift();
    if (next) {
      this.permits--;
      next();
    }
  }

  /**
   * Get the number of currently available licenses
   */
  available(): number {
    return this.permits;
  }

  /**
   * Get the waiting queue length
   */
  waitingCount(): number {
    return this.waiting.length;
  }
}
