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

import { type ReactNode, useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { merge } from 'lodash-es';
import classNames from 'classnames';
import { IconAlertCircle } from '@douyinfe/semi-icons';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { WorkflowRender } from '@coze-common/chat-workflow-render';
import {
  ChatArea,
  type ComponentTypesMap,
  useChatArea,
  useInitStatus,
  useLatestSectionMessage,
} from '@coze-common/chat-area';
import { getSlardarInstance } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Spin, Toast } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { SendType } from '@coze-arch/bot-api/developer_api';
import { ReceiveMessageBox } from '@coze-agent-ide/chat-components-adapter';
import { MessageBoxActionBarAdapter } from '@coze-agent-ide/chat-answer-action-adapter';

import { ShortcutBarRender } from './plugins/shortcut';
import { useBotDebugChatAreaComponent } from './context';
import { UploadTooltipsContent } from './components/upload-tooltips-content';
import { OnboardingMessagePop } from './components/onboarding-message-pop';

import retryStyles from './retry.module.less';
import s from './index.module.less';

export { BotDebugChatAreaComponentProvider } from './context';

export const BotDebugChatArea = ({
  readOnly = false,
  headerNode,
}: {
  readOnly?: boolean;
  headerNode?: ReactNode;
}) => {
  const [enableSendMultimodalMessage, setEnableSendMultimodalMessage] =
    useState<boolean>(true);

  const initStatus = useInitStatus();

  const { savingInfo } = usePageRuntimeStore(
    useShallow(state => ({
      savingInfo: state.savingInfo,
    })),
  );

  const interceptSend = savingInfo.saving;

  const onBeforeSubmit = () => {
    if (interceptSend) {
      Toast.warning({
        content: I18n.t('bot_execute_by_autosave'),
        showClose: false,
      });
    }

    return !interceptSend;
  };
  const { latestSectionMessageLength } = useLatestSectionMessage();
  const injectComponents = useBotDebugChatAreaComponent();
  const userHasSentMessage = latestSectionMessageLength > 0;

  if (initStatus === 'unInit' || initStatus === 'loading') {
    return (
      <div className={retryStyles['home-state']}>
        <Spin size="middle" />
      </div>
    );
  }

  if (initStatus === 'initFail') {
    return <InitFail />;
  }

  /**
   * @deprecated Please do not add or modify, the review will not pass
   * Please use a plug-in solution to achieve
   */
  const chatAreaComponentTypes: Partial<ComponentTypesMap> = {
    messageActionBarFooter: MessageBoxActionBarAdapter,
    messageActionBarHoverContent: () => null,
    contentBox: WorkflowRender,
    onboarding: OnboardingMessagePop,
    receiveMessageBox: ReceiveMessageBox,
    chatInputIntegration: {
      renderChatInputTopSlot: controller =>
        ShortcutBarRender({
          controller,
          onShortcutActive: shortcut => {
            const isTemplateShortcutActive =
              shortcut?.send_type === SendType.SendTypePanel;
            const enableMultimodalArea = !isTemplateShortcutActive;
            setEnableSendMultimodalMessage(enableMultimodalArea);
          },
        }),
    },
  };

  return (
    <ChatArea
      readonly={readOnly}
      componentTypes={merge(chatAreaComponentTypes, injectComponents)}
      enableMessageBoxActionBar
      messageGroupListClassName={s['chat-area-message-group-list']}
      enableMultimodalUpload={enableSendMultimodalMessage}
      enableLegacyUpload={!enableSendMultimodalMessage}
      textareaBottomTips={I18n.t('chat_GenAI_tips')}
      chatInputProps={{
        wrapperClassName: classNames(s['chat-input-wrapper']),
        onBeforeSubmit,
        uploadButtonTooltipContent: <UploadTooltipsContent />,
        submitClearInput: !interceptSend,
      }}
      textareaPlaceholder={
        userHasSentMessage
          ? I18n.t('store_chat_placeholder_continue')
          : I18n.t('store_chat_placeholder_blank')
      }
      isOnboardingCentered
      headerNode={headerNode}
      fileLimit={10}
    />
  );
};

const InitFail = () => {
  const { refreshMessageList } = useChatArea();
  const [sessionId] = useState(() => getSlardarInstance()?.config()?.sessionId);

  useEffect(() => {
    (async () => {
      await Promise.resolve();
      throw new CustomError('BotDebugAreaInitFail', '');
    })();
  }, []);
  return (
    <div className={retryStyles['home-state']}>
      <IconAlertCircle className={retryStyles['fail-page-icon']} />
      <div className={retryStyles['fail-page-text']}>
        <span>{I18n.t('coze_home_page_fail_text')}</span>
        <span
          className={retryStyles['fail-page-retry']}
          onClick={refreshMessageList}
        >
          {I18n.t('coze_home_page_fail_btn_retry')}
        </span>
      </div>
      {!!sessionId && (
        <div className="leading-[12px] mt-[8px] text-[12px] text-gray-400">
          {sessionId}
        </div>
      )}
    </div>
  );
};
