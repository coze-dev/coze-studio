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
import { type Event, Emitter } from '@flowgram-adapter/common';

import { type LifecycleContribution } from './lifecycle-contribution';

@injectable()
export class WindowService implements LifecycleContribution {
  protected onUnloadEmitter = new Emitter<void>();

  protected onBeforeUnloadEmitter = new Emitter<BeforeUnloadEvent>();

  get onUnload(): Event<void> {
    return this.onUnloadEmitter.event;
  }

  get onBeforeUnload(): Event<BeforeUnloadEvent> {
    return this.onBeforeUnloadEmitter.event;
  }

  onStart(): void {
    this.registerUnloadListeners();
  }

  protected registerUnloadListeners(): void {
    window.addEventListener('unload', () => this.onUnloadEmitter.fire());
    window.addEventListener('beforeunload', e =>
      this.onBeforeUnloadEmitter.fire(e),
    );
  }
}
