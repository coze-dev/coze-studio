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

import { joinPhases, Phases } from './hooks';

type IHookHandler<T> = (args: T) => T;

export interface Args {
  [key: string]: any;
}

export interface Ctxs {
  [key: string]: Args;
}

export class Program<C extends Ctxs = any> {
  static create = <K extends Ctxs = any>(plugins: IPlugin[]) => {
    const p = new Program<K>();
    p.loadPlugins(plugins);
    return p;
  };

  private hooks: string[] = [];

  private phases = [Phases.BEFORE, Phases.ON, Phases.AFTER];

  private handlers: {
    [event: string]: { handler: IHookHandler<any>; priority: number }[];
  } = {};

  /**
   * Load plugin
   * @param plugins
   */
  loadPlugins(plugins: IPlugin[]) {
    for (const plugin of plugins) {
      plugin.apply(this);
    }
  }
  /**
   * registration hook
   * @param event name
   * @param handler hook
   * @Param priority, the smaller the value, the higher the priority
   */
  register<
    K extends keyof C,
    P extends `__${'ON' | 'BEFORE' | 'AFTER'}__::${string & K}`,
  >(
    event: P,
    handler: IHookHandler<
      P extends `__${'ON' | 'BEFORE' | 'AFTER'}__::${infer R}`
        ? C[R & keyof C]
        : never
    >,
    priority = 1,
  ) {
    if (
      !this.hooks.find(h => this.phases.find(p => joinPhases(p, h) === event))
    ) {
      const res = /__(ON|BEFORE|AFTER)__::(\S+)/.exec(event);
      if (!res || !res[2]) {
        throw new Error(
          `unknown hook must be one of ${JSON.stringify(this.hooks)}`,
        );
      }
      this.hooks.push(res[2]);
    }
    const handlers = this.handlers[event];
    if (handlers) {
      handlers.push({ handler, priority });
    } else {
      this.handlers[event] = [{ handler, priority }];
    }
  }
  /**
   * trigger event
   * @param event
   * @param args
   * @returns
   */
  trigger<T extends Args = Args>(event: keyof C, args: T): T {
    if (!this.hooks.find(i => event === i)) {
      throw new Error(
        `unknown hook must be one of ${JSON.stringify(this.hooks)}`,
      );
    }
    this.phases
      // @ts-expect-error fixme
      .map(i => joinPhases(i, event))
      .forEach(i => {
        args = this.applyEvent(i, args);
      });
    return args;
  }

  private applyEvent<T extends Args = Args>(event: string, args: T) {
    const handler = this.handlers[event];
    if (handler) {
      for (const hook of handler.sort((a, b) => a.priority - b.priority)) {
        args = hook.handler.call(null, args);
      }
    }
    return args;
  }
}

export interface IPlugin<T extends Args = any> {
  apply: (program: Program<T>) => void;
}
