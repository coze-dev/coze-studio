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

import { type WaitingState, type WaitingStore } from '../../../store/waiting';

type Listener = (isProcessing: boolean) => void;

export const getChatProcessing = (state: WaitingState) =>
  !!state.waiting || !!state.sending;

export const getListenProcessChatStateChange = (
  useWaitingStore: WaitingStore,
) => {
  const callbacks = new Set<Listener>();

  const unsubscribe = useWaitingStore.subscribe(getChatProcessing, res => {
    callbacks.forEach(fn => fn(res));
  });

  return {
    listenProcessChatStateChange: (fn: Listener) => {
      callbacks.add(fn);
      return {
        dispose: () => {
          callbacks.delete(fn);
        },
      };
    },
    forceDispose: () => {
      callbacks.clear();
      unsubscribe();
    },
  };
};
