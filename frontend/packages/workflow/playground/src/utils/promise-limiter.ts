/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Limit concurrency
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
