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

import { isEqual } from 'lodash';
import { Emitter } from '@flowgram-adapter/common';

export function distinctUntilChangedFromEvent<D, F>(
  emitter: Emitter<D>,
  filter: (_data: D) => F,
): Emitter<F> {
  const nextEmitter = new Emitter<F>();

  let _prevData: F | undefined;
  const _disposeEmitter = nextEmitter.dispose.bind(nextEmitter);
  const _disposeEventListener = emitter.event(_data => {
    const _nextData = filter(_data);
    if (!isEqual(_prevData, _nextData)) {
      _prevData = _nextData;
      nextEmitter.fire(_nextData);
    }
  });

  nextEmitter.dispose = () => {
    _disposeEmitter();
    _disposeEventListener.dispose();
  };

  return nextEmitter;
}
