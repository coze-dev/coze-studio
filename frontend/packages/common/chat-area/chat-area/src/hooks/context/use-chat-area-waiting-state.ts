import { useShallow } from 'zustand/react/shallow';

import { isValidContext } from '../../utils/is-valid-context';
import { useChatAreaStoreSet } from './use-chat-area-context';

export const useChatAreaWaitingState = () => {
  const chatAreaContext = useChatAreaStoreSet();
  if (!isValidContext(chatAreaContext)) {
    throw new Error('chatAreaContext is not valid');
  }
  const { useWaitingStore } = chatAreaContext;
  const useWaitingState = () =>
    useWaitingStore(
      useShallow(state => ({
        waiting: state.waiting,
        sending: state.sending,
        responding: state.responding,
      })),
    );
  const getWaitingState = () => {
    const { sending, responding, waiting } = useWaitingStore.getState();
    return {
      sending,
      responding,
      waiting,
    };
  };
  return { useWaitingState, getWaitingState };
};
