import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useUpdateMessageIndex = () => {
  const { useMessageIndexStore } = useChatAreaStoreSet();
  return useMessageIndexStore.getState().updateIndex;
};

export const useMessageIndexValue = () => {
  const { useMessageIndexStore } = useChatAreaStoreSet();
  return useMessageIndexStore(state => ({
    readIndex: state.readIndex,
    endIndex: state.endIndex,
  }));
};
