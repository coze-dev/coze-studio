import { useShallow } from 'zustand/react/shallow';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useLatestSectionMessage = () => {
  const { useMessagesStore, useSectionIdStore } = useChatAreaStoreSet();

  const latestSectionId = useSectionIdStore(state => state.latestSectionId);

  const latestSectionMessageLength = useMessagesStore(
    useShallow(
      state =>
        state.messages.filter(msg => msg.section_id === latestSectionId).length,
    ),
  );

  return {
    latestSectionMessageLength,
  };
};
