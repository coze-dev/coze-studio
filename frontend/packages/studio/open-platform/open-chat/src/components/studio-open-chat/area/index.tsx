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

import React, { type FC, useEffect, useMemo, useRef } from 'react';

import cs from 'classnames';
import {
  ChatFlowRender,
  WorkflowRender,
} from '@coze-common/chat-workflow-render';
import {
  ChatArea,
  useInitStatus,
  type ComponentTypesMap,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n/intl';

import { type StudioChatAreaProps } from '@/types/props';
import { OpenApiSource } from '@/types/open';
import { Layout } from '@/types/client';

import { useChatAppProps } from '../store';
import { ShortcutBar } from '../components/shortcut-bar';
import { ChatInputLeftSlot } from '../components/chat-input-let-slot';

import styles from './index.module.less';

// eslint-disable-next-line complexity
export const StudioChatArea: FC<StudioChatAreaProps> = ({
  coreAreaClassName,
  className,
  showInputArea = true,
  inputPlaceholder,
  inputNativeCallbacks,
  messageGroupListClassName,
  renderChatInputTopSlot,
  isShowClearContextDivider,
  headerNode,
  messageMaxWidth,
  isMiniScreen,
  enableMultimodalUpload = false,
}) => {
  const initStatus = useInitStatus();
  const { layout, onInitStateChange, chatConfig } = useChatAppProps();
  const refContainer = useRef<HTMLDivElement>(null);
  const { readonly } = useChatAppProps();

  const { source } = chatConfig;

  const contentBox = useMemo(
    () => (source === OpenApiSource.ChatFlow ? ChatFlowRender : WorkflowRender),
    [source],
  );

  const chatAreaComponentTypes: Partial<ComponentTypesMap> = useMemo(
    () => ({
      chatInputIntegration: {
        renderChatInputTopSlot: controller => (
          <>
            {renderChatInputTopSlot?.()}
            <ShortcutBar controller={controller} />
          </>
        ),
      },
      contentBox,
    }),
    [renderChatInputTopSlot, contentBox],
  );
  useEffect(() => {
    switch (initStatus) {
      case 'initSuccess':
      case 'initFail':
        onInitStateChange?.(initStatus);
        break;
      default:
    }
  }, [initStatus, onInitStateChange]);

  if (initStatus !== 'initSuccess') {
    return null;
  }
  const uploadable = chatConfig?.ui?.chatBot?.uploadable ?? true;
  const enableLegacyUploadFlag = !enableMultimodalUpload && uploadable;
  const enableMultimodalUploadFlag = enableMultimodalUpload && uploadable;
  return (
    <div
      className={cs(styles.area, className, {
        [styles.disabled]: readonly,
      })}
      tabIndex={1000}
      ref={refContainer}
    >
      <ChatArea
        classname={coreAreaClassName}
        layout={layout === Layout.PC ? undefined : layout}
        showInputArea={showInputArea}
        newMessageInterruptScenario="never"
        messageGroupListClassName={messageGroupListClassName}
        showClearContextDivider={
          isShowClearContextDivider ||
          chatConfig?.ui?.chatBot?.isNeedClearContext
        }
        messageMaxWidth={messageMaxWidth}
        showStopRespond={true}
        enableLegacyUpload={enableLegacyUploadFlag}
        enableMultimodalUpload={enableMultimodalUploadFlag}
        fileLimit={enableMultimodalUploadFlag ? 6 : undefined}
        textareaPlaceholder={inputPlaceholder || I18n.t('chatInputPlaceholder')}
        enableMessageBoxActionBar={true}
        chatInputProps={{
          wrapperClassName: styles.chatInput,
          inputNativeCallbacks,
          safeAreaClassName:
            chatConfig?.ui?.footer?.isShow !== false ? styles['safe-area'] : '',
          leftActions: <ChatInputLeftSlot />,
        }}
        componentTypes={chatAreaComponentTypes}
        readonly={readonly}
        uiKitChatInputButtonConfig={{
          isClearContextButtonVisible: false,
          isClearHistoryButtonVisible: false,
        }}
        isMiniScreen={isMiniScreen}
        headerNode={headerNode}
      />
    </div>
  );
};
