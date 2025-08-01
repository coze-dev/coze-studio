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

import { injectable } from 'inversify';

export enum ContextKey {
  /**
   *
   */
  editorFocus = 'editorFocus',
}

export const ContextMatcher = Symbol('ContextMatcher');

export interface ContextMatcher {
  /**
   * Determines whether the expression hits the context
   */
  match: (expression: string) => boolean;
}

/**
 * Global context key context management
 */
@injectable()
export class ContextKeyService implements ContextMatcher {
  private _contextKeys: Map<string, unknown> = new Map();

  public constructor() {
    this._contextKeys.set(ContextKey.editorFocus, true);
  }

  public setContext(key: string, value: unknown): void {
    this._contextKeys.set(key, value);
  }

  public getContext<T>(key: string): T {
    return this._contextKeys.get(key) as T;
  }

  public match(expression: string): boolean {
    const keys = Array.from(this._contextKeys.keys());
    const func = new Function(...keys, `return ${expression};`);
    const res = func(...keys.map(k => this._contextKeys.get(k)));

    return res;
  }
}
