import { isUndefined } from 'lodash-es';

import { useUnselectAll } from '../public/use-unselect-all';
import { useSelectOnboarding } from '../public/use-select-onboarding';
import { useClearHistory } from '../messages/use-clear-history';
import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { proxyFreeze } from '../../utils/proxy-freeze';
import { type Message } from '../../store/types';
import { usePreference } from '../../context/preference';

export interface ChatAreaController {
  useUpdateMessages: (
    fixMessageCallback: (message: Message, nowSectionId: string) => Message,
  ) => (message: Message[]) => void;
  clearHistory: () => void;
  selectAll: () => void;
  unselectAll: () => void;
}

export const useChatAreaController = () => {
  const { useMessagesStore, useSelectionStore, useOnboardingStore } =
    useChatAreaStoreSet();

  const { updateReplyIdList, onboardingIdList } = useSelectionStore(state => ({
    updateReplyIdList: state.updateReplyIdList,
    onboardingIdList: state.onboardingIdList,
  }));
  const { enableSelectOnboarding } = usePreference();
  const unselectAll = useUnselectAll();
  const selectOnboarding = useSelectOnboarding();
  const prologue = useOnboardingStore(state => state.prologue);

  const builtinClearHistory = useClearHistory();

  const clearHistory = async () => {
    unselectAll();
    await builtinClearHistory();
  };

  const selectAll = (params?: {
    maxLength: number;
    direction: 'forward' | 'backward';
  }) => {
    const { maxLength, direction } = params ?? {};

    const selectableMessageGroupList = useMessagesStore
      .getState()
      .messageGroupList.filter(messageGroup => messageGroup.selectable);

    const replyIdList = selectableMessageGroupList
      // TODO: 需要确认下 发送的消息 ack 前 groupId 不是 replyId
      .map(messageGroup => messageGroup.groupId)
      .filter((id): id is string => Boolean(id));

    if (isUndefined(maxLength) || !direction) {
      updateReplyIdList(replyIdList);
      return;
    }

    const slicedReplyIdList = (
      direction === 'backward' ? replyIdList : replyIdList.reverse()
    ).slice(0, maxLength);
    updateReplyIdList(slicedReplyIdList);

    const firstOnboardingId = onboardingIdList.at(0);

    if (enableSelectOnboarding) {
      selectOnboarding({
        selectedId: firstOnboardingId ?? null,
        onboarding: {
          prologue,
        },
      });
    }
  };

  const getMessageList = () =>
    proxyFreeze(useMessagesStore.getState().messages);

  return {
    clearHistory,
    selectAll,
    unselectAll,
    getMessageList,
  };
};
