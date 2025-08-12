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

import { shallow } from 'zustand/vanilla/shallow';
import { ContentType } from '@coze-common/chat-core';

import { BuildInSendMessageBox } from '../send-message-box';
import { BuildInReceiveMessageBox } from '../receive-message-box';
import { BuildInContentBox } from '../content-box';
import { getIsVisibleMessageMeta } from '../../utils/message';
import { localLog } from '../../utils/local-log';
import { usePluginCustomComponents } from '../../plugin/hooks/use-plugin-custom-components';
import { PluginScopeContextProvider } from '../../plugin/context/plugin-scope-context';
import { useUIKitMessageImageAutoSizeConfig } from '../../hooks/uikit/use-ui-kit-message-image-auto-size-config';
import { useEventCallbacks } from '../../hooks/uikit/use-event-callbacks';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useIsRenderAnswerAction } from '../../hooks/messages/use-is-render-answer-action';
import { useChatAreaCustomComponent } from '../../hooks/context/use-chat-area-custom-component';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';
import { useMessageBoxContext } from '../../context/message-box';
import { getContentConfigs } from '../../constants/content';
import { RevealTrigger } from './reveal-trigger';

import styles from './index.module.less';

// TODO: Here, distinguish between the user's message and the model's message component

// eslint-disable-next-line @coze-arch/max-line-per-function -- TODO will split it later.
export const MessageBox: React.FC = memo(() => {
  const { configs, reporter } = useChatAreaContext();

  const { useMessageMetaStore, useSenderInfoStore, useFileStore } =
    useChatAreaStoreSet();

  const {
    message,
    meta,
    isFirstUserOrFinalAnswerMessage,
    isLastUserOrFinalAnswerMessage,
    functionCallMessageIdList,
  } = useMessageBoxContext();

  const hasFunctionMessage = functionCallMessageIdList?.some(id => {
    const functionCallMessageMeta = useMessageMetaStore
      .getState()
      .getMetaByMessage(id);
    return getIsVisibleMessageMeta(functionCallMessageMeta, configs);
  });

  const isMessageGroupLastMessage =
    message.role === 'user'
      ? isLastUserOrFinalAnswerMessage
      : !hasFunctionMessage && isLastUserOrFinalAnswerMessage;
  const { lifeCycleService } = useChatAreaContext();
  const eventCallbacks = useEventCallbacks();
  const { readonly, layout } = usePreference();
  const isRenderAnswerAction = useIsRenderAnswerAction();
  const showBackground = useShowBackGround();
  const componentTypes = useChatAreaCustomComponent();
  const {
    receiveMessageBox,
    sendMessageBox,
    contentBox: ContentBox,
    messageActionBarFooter: MessageBoxActionBarFooter,
    messageActionBarHoverContent: MessageBoxActionBarHoverContent,
    receiveMessageBoxTopRightSlot: ReceiveMessageBoxTopRightSlot,
  } = componentTypes;
  const { getBotInfo } = useSenderInfoStore.getState();
  const isContentLoading = useFileStore(
    state =>
      state.audioProcessMap[message.extra_info.local_message_id] ===
      'processing',
  );

  const customMessageInnerBottomComponentList = usePluginCustomComponents(
    'MessageInnerBottomSlot',
  );

  const customTextMessageInnerTopComponentList = usePluginCustomComponents(
    'TextMessageInnerTopSlot',
  );

  const customMessageBoxFooterComponentList =
    usePluginCustomComponents('MessageBoxFooter');

  const customMessageBoxHoverComponentList = usePluginCustomComponents(
    'MessageBoxHoverSlot',
  );

  localLog('render messageImpl', message.message_id);

  const isSendMessage = message.role === 'user';

  const ReceiveMessageBox = receiveMessageBox ?? BuildInReceiveMessageBox;
  const SendMessageBox = sendMessageBox ?? BuildInSendMessageBox;

  // Answer actions for footer location, required props pass through useMessageBoxContext
  const ActionBarFooter = MessageBoxActionBarFooter;

  // Hover just show the answer actions, the required props pass through useMessageBoxContext
  const ActionBarHoverContent = MessageBoxActionBarHoverContent;

  const MessageBoxUI = isSendMessage ? SendMessageBox : ReceiveMessageBox;

  const { imageAutoSizeContainerWidth, enableImageAutoSize } =
    useUIKitMessageImageAutoSizeConfig();

  // Custom ContentBox for the old mechanism
  const UsedContentBox = ContentBox ?? BuildInContentBox;

  // The Render call life cycle is used to determine whether business components need to be used for rendering - in combination with plug-ins
  const { MessageBox: DynamicCustomMessageBox } =
    lifeCycleService.render.onMessageBoxRender({ ctx: { message, meta } }) ??
    {};

  const staticCustomMessageBoxConfig =
    usePluginCustomComponents('MessageBox').at(0); // Whoever comes first, choose only one.

  // Custom MessageBox provided by plug-in mechanism
  const StaticCustomMessageBox = staticCustomMessageBoxConfig?.Component;

  // The custom MessageBox used (if any, otherwise return undefined)
  const UsedCustomMessageBox =
    DynamicCustomMessageBox ?? StaticCustomMessageBox;

  // The final used MessageBox
  const UsedMessageBox = UsedCustomMessageBox ?? MessageBoxUI;

  const reportError = (error: unknown) => {
    if (!(error instanceof Error)) {
      return;
    }

    reporter.error({
      error,
      message: 'chat area message box error',
    });
  };

  const renderFooter = (refreshContainerWidth: () => void) => {
    const usedFooter = customMessageBoxFooterComponentList?.at(0);

    if (!usedFooter) {
      return isRenderAnswerAction && ActionBarFooter ? (
        <ActionBarFooter refreshContainerWidth={refreshContainerWidth} />
      ) : null;
    }

    const { Component, pluginName } = usedFooter;
    return (
      <PluginScopeContextProvider pluginName={pluginName}>
        <Component refreshContainerWidth={refreshContainerWidth} />
      </PluginScopeContextProvider>
    );
  };

  const renderHoverContent = () => {
    const usedHoverContent = customMessageBoxHoverComponentList?.at(0);

    if (!usedHoverContent) {
      return isRenderAnswerAction && ActionBarHoverContent ? (
        <ActionBarHoverContent />
      ) : null;
    }

    const { Component, pluginName } = usedHoverContent;
    return (
      <PluginScopeContextProvider pluginName={pluginName}>
        <Component />
      </PluginScopeContextProvider>
    );
  };

  return (
    <div data-message-id={message.message_id}>
      <UsedMessageBox
        message={message}
        meta={meta}
        isContentLoading={isContentLoading}
        isMessageGroupFirstMessage={isFirstUserOrFinalAnswerMessage}
        isMessageGroupLastMessage={isMessageGroupLastMessage}
        renderFooter={renderFooter}
        hoverContent={renderHoverContent()}
        readonly={readonly}
        getBotInfo={getBotInfo}
        layout={layout}
        showBackground={showBackground}
        topRightSlot={
          ReceiveMessageBoxTopRightSlot ? (
            <ReceiveMessageBoxTopRightSlot />
          ) : null
        }
        imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
        enableImageAutoSize={enableImageAutoSize}
        eventCallbacks={eventCallbacks}
        onError={reportError}
      >
        {message.content_type === ContentType.Text && (
          <>
            {customTextMessageInnerTopComponentList?.map(
              // eslint-disable-next-line @typescript-eslint/naming-convention -- naming as expected
              ({ pluginName, Component }, index) => (
                <PluginScopeContextProvider
                  pluginName={pluginName}
                  key={pluginName}
                >
                  <Component key={index} message={message} />
                </PluginScopeContextProvider>
              ),
            )}
          </>
        )}
        {/* This is the internal implementation mechanism, and we are not going to tell the outside, so we only render children when there is no custom component. */}
        {UsedCustomMessageBox ? null : (
          <UsedContentBox
            isContentLoading={isContentLoading}
            message={message}
            meta={meta}
            eventCallbacks={eventCallbacks}
            contentConfigs={getContentConfigs()}
            getBotInfo={getBotInfo}
            layout={layout}
            showBackground={showBackground}
            readonly={readonly}
            enableImageAutoSize={enableImageAutoSize}
            isCardDisabled={meta.cardDisabled}
          />
        )}
        <div className={styles['footer-slot-style']}>
          {customMessageInnerBottomComponentList?.map(
            // eslint-disable-next-line @typescript-eslint/naming-convention -- matches the expected naming
            ({ pluginName, Component }) => (
              <PluginScopeContextProvider
                pluginName={pluginName}
                key={pluginName}
              >
                <Component message={message} />
              </PluginScopeContextProvider>
            ),
          )}
        </div>
      </UsedMessageBox>
      {UsedCustomMessageBox ? null : <RevealTrigger />}
    </div>
  );
}, shallow);
