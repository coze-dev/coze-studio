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
import {
  ThinkingPlaceholder,
  MessageBox as UIKitMessageBox,
} from '@coze-common/chat-uikit';

import { getThinkingPlaceholderTheme } from '../../utils/components/get-thinking-placeholder-theme';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';

import styles from './index.modules.less';

export const WaitGenerating = () => {
  const { messageWidth, layout, theme } = usePreference();

  const { configs } = useChatAreaContext();

  const { useWaitingStore, useSenderInfoStore, useMessagesStore } =
    useChatAreaStoreSet();

  const senderInfo = useSenderInfoStore(
    useShallow(state => {
      const botId =
        state.waitingSenderId || Object.keys(state.botInfoMap).at(0);
      return state.getBotInfo(botId);
    }),
  );

  const { waiting } = useWaitingStore(
    useShallow(state => ({
      waiting: !!state.waiting && !state.responding?.response.length,
    })),
  );

  const { functionCallLength, llmLength } = useMessagesStore(
    useShallow(state => {
      const memberSet = state.messageGroupList.at(0)?.memberSet;
      return {
        functionCallLength: memberSet?.functionCallMessageIdList.length,
        llmLength: memberSet?.llmAnswerMessageIdList.length,
      };
    }),
  );

  const showBackground = useShowBackGround();

  const showSenderInfo = configs?.showFunctionCallDetail
    ? !functionCallLength && !llmLength
    : !llmLength;

  const { selectable } = usePreference();

  if (!waiting) {
    return null;
  }

  return (
    <div
      data-testid="chat-area.waiting-generating-loading"
      className={classNames(styles['dot-wrapper'], {
        [styles['dot-wrapper-selectable'] as string]: selectable,
        [styles['dot-wrapper-no-avatar'] as string]: !showSenderInfo,
      })}
      style={{ width: messageWidth }}
    >
      <UIKitMessageBox
        messageId={null}
        theme="none"
        senderInfo={senderInfo || { id: '' }}
        showUserInfo={showSenderInfo}
        getBotInfo={useSenderInfoStore.getState().getBotInfo}
        layout={layout}
        showBackground={showBackground}
      >
        <ThinkingPlaceholder
          theme={getThinkingPlaceholderTheme({
            bizTheme: theme,
          })}
          showBackground={showBackground}
        />
      </UIKitMessageBox>
    </div>
  );
};
