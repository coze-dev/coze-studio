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

/* eslint-disable @typescript-eslint/naming-convention -- no need */

const STORAGE_KEY = 'workflow-move-into-sub-canvas-tip-visible';
const STORAGE_VALUE = 'false';

export class TipsGlobalStore {
  private static _instance?: TipsGlobalStore;
  public static get instance(): TipsGlobalStore {
    if (!this._instance) {
      this._instance = new TipsGlobalStore();
    }
    return this._instance;
  }

  private closed = false;

  public isClosed(): boolean {
    return this.isCloseForever() || this.closed;
  }

  public close(): void {
    this.closed = true;
  }

  public isCloseForever(): boolean {
    return localStorage.getItem(STORAGE_KEY) === STORAGE_VALUE;
  }

  public closeForever(): void {
    localStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
  }
}
