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
 * 限流器，对于被限流的异步方法进行以下形式的限流：
 * 1. 在 timeWindow 内的前 limit 个请求不做限制，立即发送
 * 2. timeWindow 内超过 limit 个请求后，对每个请求依次添加 onLimitDelay 毫秒的延迟
 *
 * 注意是排队添加，形如 invoke: [1(0ms), 2(0ms), 3(0ms), 4(0ms)]; limit: [1(0ms), 2(0ms), 3(100ms), 4(200ms)]
 *
 * 另注：这个设计遭到了猛烈抨击，认为 debounce 可以代替掉，实现过于复杂，但是考虑：
 * 1. 支持列表双向加载的拉取，简单使用 debounce 可能导致请求某侧丢失；添加延时可以保证不丢失请求
 * 2. 列表拉取一旦出现死循环，可能导致恶性问题，如密集地对服务端接口的高频访问
 *
 * 以上场景通常不应出现，所以 limit 设计也只是对极端场景的兜底，上层 UI 错误理应得到妥善解决
 * TODO: wlt - 补充 testcase
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
