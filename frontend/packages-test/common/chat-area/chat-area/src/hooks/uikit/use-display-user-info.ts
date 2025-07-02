import { useShallow } from 'zustand/react/shallow';
import { Layout } from '@coze-common/chat-uikit-shared';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { type Message, type UserSenderInfo } from '../../store/types';
import { usePreference } from '../../context/preference';

export const useDisplayUserInfo = (message: Message) => {
  const { layout, showUserExtendedInfo } = usePreference();
  const { useSenderInfoStore } = useChatAreaStoreSet();

  const getMessageUserInfo = useSenderInfoStore(
    useShallow(state => state.getMessageUserInfo),
  );

  const userSenderInfo = getMessageUserInfo(message?.sender_id);

  if (!userSenderInfo) {
    return null;
  }

  const infoWithoutExtend: UserSenderInfo = {
    ...userSenderInfo,
    userLabel: null,
    userUniqueName: '',
  };

  if (layout !== Layout.PC || !showUserExtendedInfo) {
    return infoWithoutExtend;
  }

  return userSenderInfo;
};
