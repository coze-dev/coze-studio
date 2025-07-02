import { type GetHistoryMessageResponse } from '@coze-common/chat-core';

import type { StoreSet } from '../../../context/chat-area-context/type';
import { type ChatAreaEventCallback } from '../../../context/chat-area-context/chat-area-callback';

export const getInsertMessages =
  (
    storeSet: StoreSet,
    onBeforeLoadMoreInsertMessages: ChatAreaEventCallback['onBeforeLoadMoreInsertMessages'],
  ) =>
  (
    res: GetHistoryMessageResponse,
    { toLatest, clearFirst }: { toLatest: boolean; clearFirst?: boolean },
  ) => {
    const { useMessagesStore } = storeSet;
    const { addMessages, findMessage } = useMessagesStore.getState();

    onBeforeLoadMoreInsertMessages?.({ data: res });

    const newAddedMessages = clearFirst
      ? res.message_list
      : res.message_list.filter(msg => !findMessage(msg.message_id));
    addMessages(newAddedMessages, { toLatest, clearFirst });
  };
