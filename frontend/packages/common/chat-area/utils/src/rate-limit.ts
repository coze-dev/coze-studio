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

import { sleep } from './async';

type Fn<ARGS extends unknown[], Ret = unknown> = (...args: ARGS) => Ret;

/**
 * Limit viewership of asynchronous methods with limited viewership of the form:
 * 1. The first limited requests in timeWindow are not limited and sent immediately
 * 2. After more than the limit of requests in timeWindow, add onLimitDelay millisecond delay to each request in turn
 *
 * Note that the queue is added, as invoked: [1 (0ms), 2 (0ms), 3 (0ms), 4 (0ms) ]; limit: [1 (0ms), 2 (0ms), 3 (100ms), 4 (200ms) ]
 *
 * Another note: This design has been slammed, arguing that debounce can be replaced and the implementation is too complex, but consider:
 * 1. Support the pull of the list loaded in both directions. Simple use of debounce may cause the request to be lost on one side; adding a delay can ensure that the request is not lost
 * 2. Once the list is pulled, it may lead to malignant problems, such as dense high-frequency access to the server level interface
 *
 * The above scenarios should not usually appear, so the limited design is only a cover for extreme scenarios, and the upper UI errors should be properly resolved
 * TODO: wlt - supplementary testcase
 */
export class RateLimit<ARGS extends unknown[], Ret> {
  constructor(
    private fn: Fn<ARGS, Promise<Ret>>,
    private config: {
      onLimitDelay: number;
      limit: number;
      timeWindow: number;
    },
  ) {}

  private records: number[] = [];

  private getNewInvokeDelay(): number {
    const { timeWindow, limit, onLimitDelay } = this.config;
    const now = Date.now();
    const windowEdge = now - timeWindow;
    const idx = this.records.findIndex(t => t >= windowEdge);
    if (idx < 0) {
      return 0;
    }
    const lasts = this.records.slice(idx);
    if (lasts.length < limit) {
      return 0;
    }
    const last = lasts.at(-1);
    if (!last) {
      return 0;
    }
    return last + onLimitDelay - now;
  }

  private clearRecords() {
    const { timeWindow } = this.config;
    const now = Date.now();
    const windowEdge = now - timeWindow;
    const idx = this.records.findLastIndex(t => t < windowEdge);
    if (idx >= 0) {
      this.records = this.records.slice(idx + 1);
    }
  }

  invoke = async (...args: ARGS): Promise<Ret> => {
    const invokeDelay = this.getNewInvokeDelay();
    const now = Date.now();
    this.records.push(invokeDelay + now);
    if (invokeDelay) {
      await sleep(invokeDelay);
    }
    this.clearRecords();
    return this.fn(...args);
  };
}
