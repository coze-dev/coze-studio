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

// todo: review 很屌很危险 ⚡️️☠️
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
   * 监听后仅生效一次
   */
  return (fn: Listener) => fnsRef.current.push(fn);
};
