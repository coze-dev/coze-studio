/**
 * 限制并发数
 */
export class PromiseLimiter<T> {
  private concurrency: number;
  private activeCount: number;
  private enable: boolean;

  constructor(concurrency: number, enable = true) {
    this.concurrency = concurrency;
    this.pendingPromises = [];
    this.activeCount = 0;
    this.enable = enable;
  }

  private pendingPromises: Array<{
    promiseFactory: () => Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: string) => void;
  }>;

  run(promiseFactory: () => Promise<T>): Promise<T> {
    if (!this.enable) {
      return promiseFactory();
    }

    return new Promise<T>((resolve, reject) => {
      this.pendingPromises.push({ promiseFactory, resolve, reject });
      this.next();
    });
  }

  private next() {
    if (this.activeCount < this.concurrency) {
      const item = this.pendingPromises.shift();
      if (!item) {
        return;
      }

      const { promiseFactory, resolve, reject } = item;
      this.activeCount++;
      promiseFactory()
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        })
        .finally(() => {
          this.activeCount--;
          this.next();
        });
    }
  }
}
