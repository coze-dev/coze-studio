/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
