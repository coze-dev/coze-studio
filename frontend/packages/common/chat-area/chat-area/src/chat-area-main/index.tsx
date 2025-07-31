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

import {
  type RefObject,
  forwardRef,
  useRef,
  useImperativeHandle,
  type FC,
  type ReactNode,
} from 'react';

import classNames from 'classnames';
import { type ScrollViewController } from '@coze-common/scroll-view';
import { UIKitEventProvider, Layout } from '@coze-common/chat-uikit-shared';
import {
  type InputRefObject,
  UIKitCustomComponentsProvider,
  type UIKitCustomComponents,
} from '@coze-common/chat-uikit';

import { localLog } from '../utils/local-log';
import { usePluginCustomComponents } from '../plugin/hooks/use-plugin-custom-components';
import { PluginScopeContextProvider } from '../plugin/context/plugin-scope-context';
import { useShowBackGround } from '../hooks/public/use-show-bgackground';
import { usePrepareMarkMessageReadService } from '../hooks/messages/use-mark-message-read';
import { useIsClearMessageHistoryLock } from '../hooks/messages/use-is-clear-message-history-lock';
import { useDragUpload } from '../hooks/file/use-drag-upload';
import { useUpdateLoadEnvContent } from '../hooks/context/load-more';
import { ScrollViewProvider } from '../context/scroll-view-context';
import { type PreferenceContextInterface } from '../context/preference/types';
import {
  PreferenceProvider,
  useProviderPassThoughContext,
} from '../context/preference/preference-context';
import { DragUploadContextProvider } from '../context/drag-upload/provider';
import { type CopywritingContextInterface } from '../context/copywriting/types';
import { CopywritingProvider } from '../context/copywriting/copywriting-context';
import { ChatInputPropsProvider } from '../context/chat-input-props/provider';
import { type ChatInputProps } from '../context/chat-input-props/context';
import {
  ChatAreaCustomComponentProvider,
  type ChatAreaCustomComponents,
} from '../context/chat-area-custom-component-context';
import { AfterInitServiceProvider } from '../context/after-init-service';
import { Preview } from '../components/preview';
import { MessageGroupList } from '../components/message-group-list';
import { InvisibleUIKitEventController } from '../components/invisible-uikit-event-controller';
import { DragUploadArea } from '../components/drag-upload-area';
import {
  ChatInputIntegration,
  type ChatInputIntegrationController,
} from '../components/chat-input-integration';

import styles from './index.modules.less';

import '../styles/uikit.less';
export interface ChatAreaProps
  extends Partial<PreferenceContextInterface>,
    Partial<CopywritingContextInterface>,
    Partial<UIKitCustomComponents>,
    ChatAreaCustomComponents {
  messageGroupListClassName?: string;
  chatInputProps?: ChatInputProps;
  classname?: string;
  layout?: Layout;
  headerNode?: ReactNode;
}

export interface ChatAreaRef {
  useGetScrollViewRef: () => RefObject<() => ScrollViewController>;
  useGetInputRef: () => RefObject<() => InputRefObject>;
}

interface ChatAreaMainProps extends ChatAreaProps {
  getScrollViewRef: RefObject<() => ScrollViewController>;
  chatInputIntegrationController: RefObject<ChatInputIntegrationController>;
}

const ChatAreaMain: FC<ChatAreaMainProps> = ({
  messageGroupListClassName,
  theme,
  uiKitCustomComponents,
  getScrollViewRef,
  chatInputIntegrationController,
  chatInputProps,
  textareaPlaceholder,
  textareaBottomTips,
  componentTypes,
  layout,
  clearContextDividerText,
  clearContextTooltipContent,
  classname,
  headerNode,
}) => {
  const { ref: containerRef, isDragOver } = useDragUpload();
  const markReadService = usePrepareMarkMessageReadService();
  useUpdateLoadEnvContent();
  const customComponentList = usePluginCustomComponents('ShareMessage');

  const showBackground = useShowBackGround();

  const customMessageListFloatSlotList = usePluginCustomComponents(
    'MessageListFloatSlot',
  );
  localLog('rerender ChatAreaMain');

  return (
    <UIKitCustomComponentsProvider
      value={{
        uiKitCustomComponents,
      }}
    >
      <UIKitEventProvider chatContainerRef={containerRef}>
        <ChatInputPropsProvider {...chatInputProps}>
          <AfterInitServiceProvider value={{ markReadService }}>
            <CopywritingProvider
              textareaPlaceholder={textareaPlaceholder}
              textareaBottomTips={textareaBottomTips}
              clearContextDividerText={clearContextDividerText}
              clearContextTooltipContent={clearContextTooltipContent}
            >
              <ChatAreaCustomComponentProvider
                value={{
                  componentTypes,
                }}
              >
                <DragUploadContextProvider isDragOver={isDragOver}>
                  <ScrollViewProvider
                    value={{
                      getScrollView: () => {
                        if (!getScrollViewRef.current) {
                          throw new Error('getScrollViewRef not ready');
                        }
                        return getScrollViewRef.current();
                      },
                    }}
                  >
                    <InvisibleUIKitEventController />
                    <div
                      ref={containerRef}
                      className={classNames(
                        styles['chat-area-main'],
                        {
                          home: theme === 'home',
                          [styles['chat-area-main-pc'] as string]:
                            layout === Layout.PC,
                          [styles['chat-area-main-mobile'] as string]:
                            layout === Layout.MOBILE,
                        },
                        classname,
                      )}
                    >
                      <div className={styles['header-node']}>{headerNode}</div>
                      {customMessageListFloatSlotList.map(
                        // eslint-disable-next-line @typescript-eslint/naming-convention -- as expected
                        ({ pluginName, Component }) => (
                          <PluginScopeContextProvider
                            pluginName={pluginName}
                            key={pluginName}
                          >
                            <Component
                              contentRef={containerRef}
                              getScrollViewRef={getScrollViewRef}
                              headerNode={headerNode}
                            />
                          </PluginScopeContextProvider>
                        ),
                      )}
                      <MessageGroupList
                        layout={layout}
                        ref={getScrollViewRef}
                        className={messageGroupListClassName}
                        hasHeaderNode={Boolean(headerNode)}
                      />
                      <ChatInputIntegration
                        className={classNames({
                          '!bg-transparent': showBackground,
                        })}
                        ref={chatInputIntegrationController}
                        getContainer={chatInputProps?.getContainer}
                      />
                      <Preview layout={layout} />
                      <DragUploadArea />
                    </div>
                    {customComponentList.map(
                      // eslint-disable-next-line @typescript-eslint/naming-convention -- as expected
                      ({ pluginName, Component }, index) => (
                        <PluginScopeContextProvider pluginName={pluginName}>
                          <Component key={`${index}ScrollViewBottom`} />
                        </PluginScopeContextProvider>
                      ),
                    )}
                  </ScrollViewProvider>
                </DragUploadContextProvider>
              </ChatAreaCustomComponentProvider>
            </CopywritingProvider>
          </AfterInitServiceProvider>
        </ChatInputPropsProvider>
      </UIKitEventProvider>
    </UIKitCustomComponentsProvider>
  );
};

export const ChatArea = forwardRef<ChatAreaRef, ChatAreaProps>((props, ref) => {
  const {
    newMessageInterruptScenario,
    enableMessageBoxActionBar,
    selectable,
    showClearContextDivider,
    messageWidth,
    readonly,
    uiKitChatInputButtonConfig,
    uikitChatInputButtonStatus,
    theme,
    enableMention,
    enableLegacyUpload,
    enableMultimodalUpload,
    showInputArea,
    showOnboardingMessage,
    showStopRespond,
    layout = Layout.PC,
    forceShowOnboardingMessage,
    isOnboardingCentered,
    fileLimit,
    stopRespondOverrideWaiting,
  } = props;
  const getScrollViewRef = useRef<() => ScrollViewController>(null);
  const {
    enableMarkRead,
    enableTwoWayLoad,
    enableImageAutoSize,
    imageAutoSizeContainerWidth,
    isInputReadonly,
    enableDragUpload,
    showUserExtendedInfo,
    enableSelectOnboarding,
    enablePasteUpload,
    uikitChatInputButtonStatus: uikitChatInputButtonStatusFromProvider,
    onboardingSuggestionsShowMode,
    showBackground,
  } = useProviderPassThoughContext();
  const chatInputIntegrationController =
    useRef<ChatInputIntegrationController>(null);
  const getInputRef = chatInputIntegrationController.current
    ?.getChatInputController as RefObject<() => InputRefObject>;

  useImperativeHandle(
    ref,
    () => ({
      useGetScrollViewRef: () => getScrollViewRef,
      useGetInputRef: () => getInputRef,
    }),
    [ref],
  );

  const isClearMessageHistoryLock = useIsClearMessageHistoryLock();

  return (
    <PreferenceProvider
      value={{
        newMessageInterruptScenario,
        enableMessageBoxActionBar,
        selectable,
        enableSelectOnboarding,
        showClearContextDivider,
        messageWidth,
        readonly: readonly || isClearMessageHistoryLock,
        uiKitChatInputButtonConfig,
        theme,
        enableMention,
        showInputArea,
        showOnboardingMessage,
        enableLegacyUpload,
        enableMultimodalUpload,
        showStopRespond,
        layout,
        forceShowOnboardingMessage,
        uikitChatInputButtonStatus:
          uikitChatInputButtonStatusFromProvider ?? uikitChatInputButtonStatus,
        fileLimit,
        enableMarkRead,
        enableTwoWayLoad,
        isOnboardingCentered,
        showUserExtendedInfo,
        enableImageAutoSize,
        imageAutoSizeContainerWidth,
        enablePasteUpload,
        isInputReadonly,
        enableDragUpload,
        onboardingSuggestionsShowMode,
        showBackground,
        stopRespondOverrideWaiting,
      }}
    >
      <ChatAreaMain
        {...props}
        getScrollViewRef={getScrollViewRef}
        chatInputIntegrationController={chatInputIntegrationController}
      />
    </PreferenceProvider>
  );
});

ChatArea.displayName = 'ChatArea';
