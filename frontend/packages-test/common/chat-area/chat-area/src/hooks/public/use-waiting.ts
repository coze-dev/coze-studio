import { useShallow } from 'zustand/react/shallow';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useWaiting = () => {
  const { useWaitingStore } = useChatAreaStoreSet();

  const waitingState = useWaitingStore(
    useShallow(state => ({
      isSending: !!state.sending,
      isWaiting: !!state.waiting,
      isResponding: !!state.responding,
    })),
  );

  return waitingState;
};
