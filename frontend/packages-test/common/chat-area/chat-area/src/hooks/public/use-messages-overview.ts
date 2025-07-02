import { useShallow } from 'zustand/react/shallow';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useMessagesOverview = () => {
  const { useMessagesStore, useSectionIdStore } = useChatAreaStoreSet();

  const latestSectionId = useSectionIdStore(state => state.latestSectionId);

  /**
   * 过滤插入的消息
   */
  const { isEmpty, latestSectionHasMessage } = useMessagesStore(
    useShallow(state => ({
      isEmpty: state.messages.length === 0,
      // todo 优化为 group 判断，无需全量扫描 messages
      latestSectionHasMessage: !!state.messages.filter(
        msg => msg.section_id === latestSectionId,
      ).length,
    })),
  );

  return {
    isEmpty,
    latestSectionHasMessage,
  };
};
