import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useLatestSectionId = () => {
  const { useSectionIdStore } = useChatAreaStoreSet();

  const latestSectionId = useSectionIdStore(state => state.latestSectionId);

  return latestSectionId;
};
