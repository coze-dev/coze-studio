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

export { ChatArea } from './chat-area-main';
export { ChatAreaProviderMethod } from './context/chat-area-context/type';
export { ChatAreaProvider } from './context/chat-area-context/provider';
export {
  useMessageBoxContext,
  useUnsafeMessageBoxContext,
} from './context/message-box';
export { type ChatAreaProps, type ChatAreaRef } from './chat-area-main';
export { ChatAreaProviderProps } from './context/chat-area-context/type';
export type {
  MessageCallback,
  ChatAreaEventCallback,
  SendMessageCallback,
  SendMessageFrom,
  SendMessageFailedCallback,
  MessageCallbackParams,
} from './context/chat-area-context/chat-area-callback';
export {
  IgnoreMessageType,
  allIgnorableMessageTypes,
} from './context/chat-area-context/type';
export {
  useStateWithLocalCache,
  MessageBoxTheme,
} from '@coze-common/chat-uikit';
export {
  CURSOR_TO_LOAD_LATEST_MESSAGE,
  CURSOR_TO_LOAD_LAST_READ_MESSAGE,
} from './constants/message';

export { ComponentTypesMap } from './components/types';
export { ContentType, Scene } from '@coze-common/chat-core';
export { useChatArea } from './hooks/context/use-chat-area';
export { ContextDivider } from './components/context-divider';
export { type ChatAreaCustomComponents } from './context/chat-area-custom-component-context';
export { type NewMessageInterruptScenario } from './context/preference';
export { AllChatAreaPreference } from './context/preference/types';
export {
  isBusinessError,
  parseErrorInfoFromErrorMessage,
  BusinessError,
  ChatBusinessErrorCode,
  CODE_JINJA_FORMAT_ERROR,
} from './service/helper/parse-error-info';
export { useInitStatus } from './hooks/context/use-init-status';
export { InitStatus } from './store/global-init';
export { useConversationId } from './hooks/context/use-conversation-id';

export {
  useSendTextMessage,
  useSendImageMessage,
  useSendFileMessage,
  useRegenerateMessageByUserMessageId,
  useSendMultimodalMessage,
  useSendNormalizedMessage,
} from './hooks/messages/use-send-message';
export { useChatAreaWaitingState } from './hooks/context/use-chat-area-waiting-state';
export { type CreateChatCoreOverrideConfig } from './context/chat-area-context/type';

export { type ChatAreaController } from './hooks/controller/use-chat-area-controller';

export {
  type MessageGroup,
  type Message,
  type MessageMeta,
  type UserInfoMap,
  type MessageExtraInfoBotState,
} from './store/types';

export { SelectionChangeParams } from './context/chat-area-context/chat-area-callback';
export { OnboardingSelectChangeParams } from './context/chat-area-context/chat-area-callback';

export { useWaiting } from './hooks/public/use-waiting';
export { useUpdateMessageIndex } from './hooks/public/use-message-index';
export {
  useReporter,
  useMessageWidth,
  useChatAreaLayout,
} from './hooks/public/common';
export { useManualInit } from './hooks/public/use-manual-init';

export {
  useBotInfo,
  useBotInfoWithSenderId,
  useSetBotInfoBatch,
} from './hooks/public/use-bot-info';
export { useLimitedChatCore } from './hooks/public/use-limited-chat-core';
export { useSendNewMessage } from './hooks/messages/use-send-message/new-message';
export { useMessagesOverview } from './hooks/public/use-messages-overview';

export { useChatAreaController } from './hooks/controller/use-chat-area-controller';

export type { SenderInfo, SenderInfoMap, UserSenderInfo } from './store/types';

export { useGetMessageGroup } from './hooks/public/use-get-message-group';

export { Waiting, WaitingPhase } from './store/waiting';
export {
  useSubscribeWaiting,
  WaitingChangeCallback,
} from './hooks/public/use-subscribe-waiting';
export { useDeleteMessageGroup } from './hooks/public/use-delete-message-group';
export { useShowBackGround } from './hooks/public/use-show-bgackground';
export { getBotState } from './store/helpers/get-bot-state';
export { type MixInitResponse } from './context/chat-area-context/type';
export { usePreference } from './context/preference';
export { useClearContext } from './hooks/messages/use-clear-context';
export { useClearHistory } from './hooks/messages/use-clear-history';

export { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
export { SuggestionItem as UIKitSuggestionItem } from '@coze-common/chat-uikit';
export { UIKitCustomComponentsMap } from '@coze-common/chat-uikit';
export {
  type BotInfoUpdate,
  type UpdateBotInfoByImmer,
  type WaitingSenderId,
} from './store/sender-info';
export { useGetMessages } from './hooks/public/use-get-messages';
export { getReportError } from './report-events';
export { PluginScopeContextProvider } from './plugin/context/plugin-scope-context';
export { usePluginCustomComponents } from './plugin/hooks/use-plugin-custom-components';
export { CustomMessageInnerBottomSlot } from './plugin/types/plugin-component/message-box';
export { useLatestSectionMessage } from './hooks/messages/use-latest-section-message';
export {
  useLoadMoreClient,
  useLoadEagerlyUnconditionally,
} from './context/load-more';
export { CustomShareMessage } from './plugin/types/plugin-component/message-box';
export { useMessageIndexValue } from './hooks/public/use-message-index';
export {
  getIsAnswer,
  getIsTriggerMessage,
  getIsNotificationMessage,
  getIsTextMessage,
  getIsAsyncResultMessage,
  getIsImageMessage,
  isFallbackErrorMessage,
} from './utils/message';

export {
  isRequireInfoInterruptMessage,
  isAnswerFinishVerboseMessage,
} from './utils/verbose';

export { useIsOnboardingEmpty } from './hooks/public/use-is-onboarding-empty';

export { useOnboardingCenterOffset } from './hooks/public/use-onboarding-center-offset';
export { useStopResponding } from './hooks/messages/use-stop-responding';

export { NullableType } from './typing/util-types';

export { type ChatInputIntegrationController } from './components/chat-input-integration';
export { ChatInput, type ChatInputProps } from './components/chat-input';
export { useGetRegisteredPlugin } from './hooks/plugins/use-get-chatcore-plugin';
export { FileStatus } from './store/types';
/**
 * @Deprecated, the export will be removed later
 */
export { useChatAreaContext } from './hooks/context/use-chat-area-context';
/**
 * @Deprecated, the export will be removed later
 */
export { useChatAreaStoreSet } from './hooks/context/use-chat-area-context';

export { useCouldSendNewMessage } from './hooks/messages/use-stop-responding';
export { useCopywriting } from './context/copywriting';
export { type OnboardingSuggestionItem } from './store/types';
export { ChatAreaLifeCycleEventMap } from './context/chat-area-context/chat-area-callback';

export { getContentConfigs } from './constants/content';

export { useFile } from './hooks/public/use-file';
/**
 * Plug-in System Export Start
 */
export { usePluginPublicMethods } from './plugin/hooks/use-plugin-public-methods';

export {
  useReadonlyPlugin,
  useWriteablePlugin,
} from './plugin/hooks/use-plugin';
export {
  ReadonlyAppLifeCycleService,
  WriteableAppLifeCycleService,
  OnBeforeListenChatCoreParam,
} from './plugin/plugin-class/service/app-life-cycle-service';
export {
  ReadonlyMessageLifeCycleService,
  WriteableMessageLifeCycleService,
} from './plugin/plugin-class/service/message-life-cycle-service';
export {
  ReadonlyCommandLifeCycleService,
  WriteableCommandLifeCycleService,
} from './plugin/plugin-class/service/command-life-cycle-service';
export {
  ReadonlyChatAreaPlugin,
  WriteableChatAreaPlugin,
} from './plugin/plugin-class/plugin';
export {
  RegisterPlugin,
  PluginRegistryEntry,
} from './plugin/types/register-plugin';
export { getLimitSelector } from './plugin/hooks/use-limit-selector';
export { OnAfterInitialContext } from './plugin/types/plugin-class/app-life-cycle';
export {
  type OnAfterDeleteMessageContext,
  type OnAfterProcessReceiveMessageContext,
  type OnBeforeDeleteMessageContext,
  type OnBeforeMessageGroupListUpdateContext,
  type OnDeleteMessageErrorContext,
  type OnBeforeProcessReceiveMessageContext,
  type OnBeforeSendMessageContext,
  type OnAfterSendMessageContext,
  type OnSendMessageErrorContext,
  type OnBeforeGetMessageHistoryListContext,
  type OnBeforeReceiveMessageContext,
  type OnBeforeAppendSenderMessageIntoStore,
  type OnAfterAppendSenderMessageIntoStore,
  OnBeforeDistributeMessageIntoMemberSetContent,
} from './plugin/types/plugin-class/message-life-cycle';
export {
  type OnImageClickContext,
  type OnBeforeClearContextContext,
  type OnOnboardingSelectChangeContext,
  type OnStopRespondingErrorContext,
  type OnSelectionChangeContext,
  type OnLinkElementContext,
  type OnImageElementContext,
} from './plugin/types/plugin-class/command-life-cycle';

export {
  type OnTextContentRenderingContext,
  type OnMessageBoxRenderContext,
} from './plugin/types/plugin-class/render-life-cycle';

export { PluginMode, PluginName } from './plugin/constants/plugin';

export { type CustomContentBox } from './plugin/types/plugin-component/content-box';

export {
  ReadonlyRenderLifeCycleService,
  WriteableRenderLifeCycleService,
} from './plugin/plugin-class/service/render-life-cycle-service';
export { type CustomTextMessageInnerTopSlot } from './plugin/types/plugin-component/message-box';

export { ChatAreaPluginContext } from './plugin/types/plugin-class/chat-area-plugin-context';
export { type CustomComponent } from './plugin/types/plugin-component';
export {
  createWriteableLifeCycleServices,
  createReadonlyLifeCycleServices,
} from './plugin/utils/create-life-cycle-service';

export { createCustomComponents } from './plugin/utils/create-custom-component';
export {
  ReadonlyLifeCycleServiceGenerator,
  WriteableLifeCycleServiceGenerator,
  WriteableAppLifeCycleServiceGenerator,
  WriteableCommandLifeCycleServiceGenerator,
  WriteableMessageLifeCycleServiceGenerator,
  WriteableRenderLifeCycleServiceGenerator,
  ReadonlyAppLifeCycleServiceGenerator,
  ReadonlyMessageLifeCycleServiceGenerator,
  ReadonlyCommandLifeCycleServiceGenerator,
  ReadonlyRenderLifeCycleServiceGenerator,
} from './plugin/types/utils/create-life-cycle-service';
/**
 * Plug-in System Export End
 */
export { useLatestSectionId } from './hooks/public/use-latest-section-id';
export { PluginAsyncQuote } from './components/plugin-async-quote';
export { type InsertedElementItem } from '@coze-arch/bot-md-box-adapter';

export { MessageListFloatSlot } from './plugin/types/plugin-component/content-box';
export { proxyFreeze } from './utils/proxy-freeze';
export { getReceiveMessageBoxTheme } from './utils/components/get-receive-message-box-theme';
export { useIsSendMessageLock } from './hooks/public/use-is-send-message-lock';
export { useIsDeleteMessageLock } from './hooks/public/use-is-delete-message-lock';
export { useIsClearHistoryLock } from './hooks/public/use-is-clear-history-lock';
export { useHasMessageList } from './hooks/public/use-has-message-list';
export {
  ChatMessageMetaType,
  type SendMessageOptions,
  messageSource,
  MessageSource,
} from '@coze-common/chat-core';
export { type OnboardingSelectChangeCallback } from './context/chat-area-context/chat-area-callback';
export { ChatInputArea } from './components/chat-input';
