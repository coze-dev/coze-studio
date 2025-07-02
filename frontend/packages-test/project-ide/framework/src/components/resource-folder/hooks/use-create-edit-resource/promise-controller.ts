class PromiseController<T, O> {
  private lastVersion: number;
  private callbacks: Array<(v: O) => void> = [];
  private mainFunction: (v: T) => Promise<O>;

  constructor() {
    this.lastVersion = 0;
  }

  registerPromiseFn(fn: (v: T) => Promise<O>) {
    this.mainFunction = fn;
    return this;
  }

  registerCallbackFb(cb: (v: O) => void) {
    this.callbacks.push(cb);
    return this;
  }

  async excute(v: T) {
    if (!this.mainFunction) {
      return;
    }
    this.lastVersion += 1;
    const currentVersion = this.lastVersion;
    const res = await this.mainFunction(v);
    if (this.lastVersion === currentVersion) {
      this.callbacks.forEach(cb => cb(res));
    }
  }

  dispose() {
    this.callbacks = [];
  }
}

export { PromiseController };
