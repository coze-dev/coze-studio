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
import {
  isNumber,
  Emitter,
  logger,
  DisposableCollection,
} from '@flowgram-adapter/common';

import { type URI } from '../common';
import { BrowserHistory, type HistoryState } from './browser-history';

/** Location structure */
interface Location {
  /** The unique identifier is usually a uri. */
  uri: URI;
  /** reserved field */
}

@injectable()
class NavigationHistory {
  private stack: Location[] = [];

  private idx = -1;

  private history = new BrowserHistory();

  private onChangeEmitter = new Emitter<Location>();

  private onPopstateEmitter = new Emitter<Location>();

  onDidHistoryChange = this.onChangeEmitter.event;

  onPopstate = this.onPopstateEmitter.event;

  private disposable = new DisposableCollection(
    this.history,
    this.onChangeEmitter,
    this.onPopstateEmitter,
  );

  get location() {
    return this.stack[this.idx];
  }

  init() {
    this.history.init();
    this.disposable.push(this.history.onChange(this.listener));
  }

  dispose() {
    this.disposable.dispose();
  }

  pushOrReplace(location: Location, replace = false) {
    // If it is in a fallback state, all subsequent history is cleared
    if (this.stack.length > this.idx + 1) {
      this.stack = this.stack.slice(0, this.idx + 1);
    }
    return replace ? this.replace(location) : this.push(location);
  }

  push(location: Location) {
    logger.log('navigation history push');
    if (this.similar(location, this.location)) {
      logger.log('location is similar');
      return;
    }
    this.stack.push(location);
    this.idx = this.stack.length - 1;
    this.history.push(location.uri, this.idx);
    this.onChangeEmitter.fire(location);
  }

  replace(location: Location) {
    logger.log('navigation history replace');

    this.stack.splice(this.idx + 1, 0, location);
    this.idx = this.stack.length - 1;
    this.history.replace(location.uri, this.idx);
    this.onChangeEmitter.fire(location);
  }

  private go(delta: number) {
    const next = this.idx + delta;
    const nextLocation = this.stack[next];
    // Crossing the border is treated as invalid
    if (next >= this.stack.length || next < 0 || !nextLocation) {
      return;
    }
    this.idx = next;
    window.history.go(delta);
    this.onChangeEmitter.fire(nextLocation);
    return this.stack[this.idx];
  }

  back() {
    return this.go(-1);
  }

  canGoBack() {
    return this.idx >= 1;
  }

  forward() {
    return this.go(1);
  }

  canGoForward() {
    return this.idx >= 0 && this.idx !== this.stack.length - 1;
  }

  private listener = (state: HistoryState) => {
    /** Do nothing when the state cannot be correctly recognized */
    if (!state || !isNumber(state.fIdx) || !state.uri) {
      return;
    }
    const { fIdx: idx } = state;
    /** Index out of bounds */
    if (idx >= this.stack.length || idx < 0) {
      return;
    }
    this.idx = idx;
    this.onChangeEmitter.fire(this.location);
    this.onPopstateEmitter.fire(this.location);
  };

  private similar(
    left: Location | undefined,
    right: Location | undefined,
  ): boolean {
    if (left === undefined || right === undefined) {
      return left === right;
    }
    return left.uri.toString() === right.uri.toString();
  }
}

export { NavigationHistory, type Location };
