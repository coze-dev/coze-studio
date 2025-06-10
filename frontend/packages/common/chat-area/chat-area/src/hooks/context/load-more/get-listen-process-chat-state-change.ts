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
