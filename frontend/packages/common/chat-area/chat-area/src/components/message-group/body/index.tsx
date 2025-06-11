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
          // 看起来 functioncall 消息的 answer action 挑战了 MessageBoxProvider 的设计
          <MessageBoxProvider
            groupId={groupId}
            messageUniqKey={functionCallMessageIdList.at(0) ?? ''}
            regenerateMessage={regenerateMessage}
            functionCallMessageIdList={functionCallMessageIdList}
            isFirstUserOrFinalAnswerMessage={false}
            isLastUserOrFinalAnswerMessage={false}
          >
            {/* function call运行过程 */}
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
