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

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

type BaseEventParamsType = Record<string, Any>;

export class BaseEvent<T extends string, O extends BaseEventParamsType> {
  protected deps: Record<T, ((data?: Any) => Any)[]>;

  constructor() {
    this.deps = {} as any;
  }

  on(name: T, func: (data?: O[T]) => Any): void {
    if (this.deps[name]) {
      this.deps[name].push(func);
    } else {
      this.deps[name] = [func];
    }
  }

  once(name: T, func: (data?: O[T]) => Any): void {
    const f = (data: Any) => {
      func(data);
      this.un(name, f);
    };
    if (this.deps[name]) {
      this.deps[name].push(f);
    } else {
      this.deps[name] = [f];
    }
  }

  un(name?: T, func?: (data?: O[T]) => Any): void {
    if (!name) {
      this.deps = {} as any;
      return;
    }
    if (func) {
      this.deps[name] = this.deps[name].filter(fn => fn !== func);
    } else {
      delete this.deps[name];
    }
  }

  emit(name: T, data?: O[T]): void {
    if (this.deps[name]) {
      this.deps[name].forEach(fn => fn(data));
    }
  }
}
