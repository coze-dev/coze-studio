import { memo } from 'react';

import { isEqual } from 'lodash-es';

import { findMessageGroupById } from '../../utils/message-group/message-group';
import { localLog } from '../../utils/local-log';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { MessageGroupWrapper } from './wrapper';
import { MessageGroupBody } from './body';

export const MessageGroupImpl: React.FC<{ groupId: string }> = memo(
  ({ groupId }) => {
    const { useMessagesStore, useSenderInfoStore } = useChatAreaStoreSet();

    const messageGroup = useMessagesStore(
      s => findMessageGroupById(s.messageGroupList, groupId),
      isEqual,
    );

    if (!messageGroup) {
      throw new Error(`failed to get messageGroup by groupId ${groupId}`);
    }

    localLog('render MessageGroupImpl', groupId);
    return (
      <MessageGroupWrapper messageGroup={messageGroup}>
        <MessageGroupBody
          messageGroup={messageGroup}
          getBotInfo={useSenderInfoStore.getState().getBotInfo}
        />
      </MessageGroupWrapper>
    );
  },
);

export const MessageGroup = memo(MessageGroupImpl);
MessageGroup.displayName = 'ChatAreaMessageGroup';
MessageGroupImpl.displayName = 'ChatAreaMessageGroupImpl';
