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
 
import { Disposable, DisposableCollection, Emitter } from '@flowgram-adapter/common';

import { type URI } from '../common';

export interface HistoryState {
  /**
   * uri.toString()
   */
  uri?: string;

  /**
   * 在栈中的索引
   * react-router 使用「idx」，使用「fIdx」防止串数据
   */
  fIdx?: number;
}

const POP_STATE_EVENT_TYPE = 'popstate';

const uriToUrl = (uri: URI) => {
  let url = uri.path.toString();
  const { query } = uri;
  if (query) {
    url += `?${query}`;
  }
  const hash = uri.fragment;
  if (hash) {
    url += '#hash';
  }
  return url;
};

export class BrowserHistory implements Disposable {
  private window = document.defaultView || window;

  private history = this.window.history;

  private onChangeEmitter = new Emitter<HistoryState>();

  onChange = this.onChangeEmitter.event;

  private disposable = new DisposableCollection(this.onChangeEmitter);

  private get state() {
    return this.history.state;
  }

  private get idx() {
    return this.state?.fIdx || null;
  }

  private listener = (e: any) => {
    this.onChangeEmitter.fire((e.state || {}) as HistoryState);
  };

  init() {
    /**
     * 初始化的时候 index 必然为 null
     * 如果不是，说明有别的框架或者在直接使用 history.pushState 或者 history.replaceState 污染
     */
    if (this.idx === null) {
      this.history.replaceState({ ...this.state, fIdx: -1, uri: '' }, '');
    }
    this.window.addEventListener(POP_STATE_EVENT_TYPE, this.listener);
    this.disposable.push(
      Disposable.create(() =>
        this.window.removeEventListener(POP_STATE_EVENT_TYPE, this.listener),
      ),
    );
  }

  push(to: URI, idx = this.idx + 1) {
    const state = {
      uri: to.toString(),
      fIdx: idx,
    };
    const url = uriToUrl(to);
    try {
      this.history.pushState(state, '', url);
    } catch {
      /**
       * history 还是有可能因为 state 或者浏览器等原因挂掉的
       * 降级成直接跳转
       */
      this.window.location.assign(url);
    }
  }

  replace(to: URI, idx = this.idx) {
    const state = {
      uri: toString(),
      fIdx: idx,
    };
    const url = uriToUrl(to);
    this.history.replaceState(state, '', url);
  }

  go(n: number) {
    return this.history.go(n);
  }

  dispose() {
    this.disposable.dispose();
  }
}
