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

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
import { type GetBotInfo } from '@coze-common/chat-uikit-shared';

import { type ComponentTypesMap } from '../types';
import {
  getIsVisibleMessageMeta,
  getMessageUniqueKey,
} from '../../utils/message';
import { getMessageUnitsByFunctionCallMessageList } from '../../utils/fucntion-call/function-message-unit';
import { type Message, type MessageGroup } from '../../store/types';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useIsRenderAnswerAction } from '../../hooks/messages/use-is-render-answer-action';
import {
  useIsGroupAnswerFinish,
  useIsGroupFakeInterruptAnswer,
} from '../../hooks/messages/use-anwer-message-helper';
import { useChatAreaCustomComponent } from '../../hooks/context/use-chat-area-custom-component';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';
import { useMessageBoxContext } from '../../context/message-box';
import { FunctionCallMessagesCollapse } from './function-call-content';

import styles from './index.module.less';

const FunctionCallMessageBoxImpl: ComponentTypesMap['functionCallMessageBox'] =
  ({
    functionCallMessageList,
    isMessageFromOngoingChat,
    isRelatedChatComplete,
    getBotInfo,
    isFakeInterruptAnswer,
  }) => {
    const messageUnitList = getMessageUnitsByFunctionCallMessageList(
      functionCallMessageList,
    );

    const { configs } = useChatAreaContext();
    const { useMessageMetaStore, useSenderInfoStore } = useChatAreaStoreSet();
    const { message } = useMessageBoxContext();
    const componentTypes = useChatAreaCustomComponent();
    const {
      messageActionBarFooter: MessageBoxActionBarFooter,
      messageActionBarHoverContent: MessageBoxActionBarHoverContent,
    } = componentTypes;
    const { layout } = usePreference();
    const isRenderAnswerAction = useIsRenderAnswerAction();
    const showBackground = useShowBackGround();
    const senderInfo = useSenderInfoStore(
      useShallow(state => {
        const botId = Object.keys(state.botInfoMap).at(0);
        return state.getBotInfo(functionCallMessageList[0]?.sender_id || botId);
      }),
    );

    const getMetaByMessage = useMessageMetaStore(
      state => state.getMetaByMessage,
    );
    const isInvisible = functionCallMessageList.every(msg => {
      const meta = getMetaByMessage(msg.message_id);
      return !getIsVisibleMessageMeta(meta, configs);
    });

    // Answer actions for footer location, required props pass through useMessageBoxContext
    const ActionBarFooter = MessageBoxActionBarFooter;

    // Hover just show the answer actions, the required props pass through useMessageBoxContext
    const ActionBarHoverContent = MessageBoxActionBarHoverContent;

    if (!messageUnitList.length || isInvisible) {
      return null;
    }

    return (
      <div className={classNames(styles['function-call-message-box'])}>
        <UIKitMessageBox
          messageId={getMessageUniqueKey(message)}
          theme="none"
          senderInfo={senderInfo || { id: '' }}
          showUserInfo={true}
          getBotInfo={getBotInfo}
          layout={layout}
          showBackground={showBackground}
          renderFooter={refreshContainerWidth =>
            isRenderAnswerAction && ActionBarFooter ? (
              <ActionBarFooter refreshContainerWidth={refreshContainerWidth} />
            ) : null
          }
          hoverContent={
            isRenderAnswerAction && ActionBarHoverContent ? (
              <ActionBarHoverContent />
            ) : null
          }
        >
          <FunctionCallMessagesCollapse
            isMessageFromOngoingChat={isMessageFromOngoingChat}
            isRelatedChatComplete={isRelatedChatComplete}
            messageUnits={messageUnitList}
            isFakeInterruptAnswer={isFakeInterruptAnswer}
          />
        </UIKitMessageBox>
      </div>
    );
  };

export const FunctionCallMessageBox: React.FC<{
  messageGroup: MessageGroup;
  getBotInfo: GetBotInfo;
}> = ({ messageGroup, getBotInfo }) => {
  const { useWaitingStore, useMessagesStore } = useChatAreaStoreSet();

  const isMessageFromOngoingChat = useWaitingStore(state =>
    Boolean(state.responding?.replyId === messageGroup.groupId),
  );

  // Received final answer
  const isRelatedChatComplete = useIsGroupAnswerFinish(messageGroup);

  const isFakeInterruptAnswer = useIsGroupFakeInterruptAnswer(messageGroup);

  const functionCallMessageList = useMessagesStore(
    useShallow(state =>
      messageGroup.memberSet.functionCallMessageIdList
        .map(id => state.findMessage(id))
        .filter((item): item is Message => Boolean(item)),
    ),
  );
  return (
    <FunctionCallMessageBoxImpl
      functionCallMessageList={functionCallMessageList}
      isMessageFromOngoingChat={isMessageFromOngoingChat}
      isRelatedChatComplete={isRelatedChatComplete}
      getBotInfo={getBotInfo}
      isFakeInterruptAnswer={isFakeInterruptAnswer}
    />
  );
};

FunctionCallMessageBox.displayName = 'ChatAreaFunctionCallMessageBox';
FunctionCallMessageBoxImpl.displayName = 'ChatAreaFunctionCallMessageBoxImpl';
