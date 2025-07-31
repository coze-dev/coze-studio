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

import { useEffect, useMemo, useRef } from 'react';

import { useImperativeLayoutEffect } from '@coze-common/chat-hooks';

import { type MessagesStore } from '../../../store/messages';

type Listener = () => void;

const invoke = (fn: () => void) => fn();

class ListenMessageLengthChange {
  private unsubscribe: () => void;
  constructor(useMessagesStore: MessagesStore) {
    this.unsubscribe = useMessagesStore.subscribe(
      state => state.messages.length,
      () => this.fns.forEach(invoke),
    );
  }

  private fns = new Set<Listener>();

  listenMessagesLengthChange(fn: Listener) {
    this.fns.add(fn);
    return {
      dispose: () => {
        this.fns.delete(fn);
      },
    };
  }

  forceDispose = () => {
    this.fns.clear();
    this.unsubscribe();
  };
}

// Todo: review is dick and dangerous ⚡☠️
export const useListenMessagesLengthChangeLayoutEffect = (
  useMessagesStore: MessagesStore,
) => {
  const fnsRef = useRef<Listener[]>([]);
  const trigger = () => {
    fnsRef.current.forEach(invoke);
    fnsRef.current = [];
  };

  const askTrigger = useImperativeLayoutEffect(trigger);
  const listener = useMemo(
    () => new ListenMessageLengthChange(useMessagesStore),
    [],
  );
  useEffect(() => listener.forceDispose, []);
  useEffect(() => {
    const { dispose } = listener.listenMessagesLengthChange(askTrigger);
    return dispose;
  }, []);

  /**
   * It only takes effect once after monitoring
   */
  return (fn: Listener) => fnsRef.current.push(fn);
};
