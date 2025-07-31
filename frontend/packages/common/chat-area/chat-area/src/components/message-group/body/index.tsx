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

import { type ComponentTypesMap } from '../../types';
import { MessageBox } from '../../message-box';
import { FunctionCallMessageBox } from '../../fuction-call-message';
import { isMessageGroupEqual } from '../../../utils/message-group/message-group';
import { useRegenerateMessage } from '../../../hooks/messages/use-send-message';
import { MessageBoxProvider } from '../../../context/message-box/provider';

export const MessageGroupBody: ComponentTypesMap['messageGroupBody'] = memo(
  ({ messageGroup, getBotInfo }) => {
    const {
      groupId,
      memberSet: {
        userMessageId,
        llmAnswerMessageIdList,
        functionCallMessageIdList,
      },
    } = messageGroup;

    const regenerate = useRegenerateMessage();

    const regenerateMessage = () => regenerate(messageGroup);

    return (
      <>
        {llmAnswerMessageIdList.map((messageId, index) => {
          const isFirst = index === llmAnswerMessageIdList.length - 1;
          const isLast = index === 0;
          return (
            <MessageBoxProvider
              groupId={groupId}
              messageUniqKey={messageId}
              key={messageId}
              regenerateMessage={regenerateMessage}
              functionCallMessageIdList={functionCallMessageIdList}
              isFirstUserOrFinalAnswerMessage={isFirst}
              isLastUserOrFinalAnswerMessage={isLast}
            >
              <MessageBox />
            </MessageBoxProvider>
          );
        })}
        {Boolean(functionCallMessageIdList.length) && (
          // It seems that the functioncall answer action challenges the design of the MessageBoxProvider
          <MessageBoxProvider
            groupId={groupId}
            messageUniqKey={functionCallMessageIdList.at(0) ?? ''}
            regenerateMessage={regenerateMessage}
            functionCallMessageIdList={functionCallMessageIdList}
            isFirstUserOrFinalAnswerMessage={false}
            isLastUserOrFinalAnswerMessage={false}
          >
            {/* Function call */}
            <FunctionCallMessageBox
              messageGroup={messageGroup}
              getBotInfo={getBotInfo}
            />
          </MessageBoxProvider>
        )}

        {userMessageId ? (
          <MessageBoxProvider
            groupId={groupId}
            messageUniqKey={userMessageId}
            key={userMessageId}
            regenerateMessage={regenerateMessage}
            isFirstUserOrFinalAnswerMessage
            isLastUserOrFinalAnswerMessage
          >
            <MessageBox />
          </MessageBoxProvider>
        ) : null}
      </>
    );
  },
  ({ messageGroup: oldGroup }, { messageGroup: currentGroup }) =>
    isMessageGroupEqual(oldGroup, currentGroup),
);

MessageGroupBody.displayName = 'ChatAreaMessageGroupBody';
