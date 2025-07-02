export const sleep = (t = 0) => new Promise(resolve => setTimeout(resolve, t));

export class Deferred<T = void> {
  promise: Promise<T>;
  resolve!: (value: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- .
  reject!: (reason?: any) => void;
  then: Promise<T>['then'];
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.then = this.promise.then.bind(this.promise);
  }
}
