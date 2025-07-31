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

export {
  type ICardEmptyConfig,
  type ICopywritingConfig,
  type IMessage,
  type IBaseContentProps,
  type IContentConfig,
  type IContentConfigs,
  type ICardCopywritingConfig,
  type IFileCopywritingConfig,
  type IChatUploadCopywritingConfig,
  type IconType,
  Layout,
} from './types/common';

export {
  type IContent,
  type ISuggestionContent,
  type IImageContent,
  type IFileContent,
  type IFunctionCallContent,
  type GetBotInfo,
  type MdBoxProps,
  ContentBoxType,
} from './types/content';

export {
  type ISimpleFunctionContentCopywriting,
  type IChatInputCopywritingConfig,
} from './types/copywriting';

export {
  type IEventCallbacksParams,
  type LinkEventData,
  type IOnLinkClickParams,
  type IOnImageClickParams,
  type IOnCancelUploadParams,
  type IOnRetryUploadParams,
  type IOnSuggestionClickParams,
  type IOnMessageRetryParams,
  type IOnCopyUploadParams,
  type IOnCardSendMsg,
  type IOnCardUpdateStatus,
  type MouseEventProps,
  type IEventCallbacks,
} from './types/event';

export {
  type IFileInfo,
  type IFileUploadInfo,
  type IFileAttributeKeys,
  type IFileCardTooltipsCopyWritingConfig,
} from './types/file';

export { useUiKitEventCenter } from './context/event-center';

export {
  UIKitEvents,
  type UIKitEventMap,
  type UIKitEventCenter,
  type UIKitEventProviderProps,
} from './context/event-center/type';

export {
  UIKitEventContext,
  UIKitEventProvider,
} from './context/event-center/context';

export { useObserveChatContainer } from './context/event-center/hooks';

export {
  UploadType,
  MAX_FILE_MBYTE,
  DEFAULT_MAX_FILE_SIZE,
  ACCEPT_FILE_EXTENSION,
} from './constants/file';

export {
  type MentionList,
  type SendButtonProps,
  type SendFileMessagePayload,
  type SendTextMessagePayload,
  type UiKitChatInputButtonConfig,
  type UiKitChatInputButtonStatus,
  type IChatInputProps,
  type InputMode,
} from './types/chat-input';

export {
  type AudioRecordProps,
  type AudioRecordEvents,
  type AudioRecordOptions,
} from './types/chat-input/audio-record';

export {
  type InputNativeCallbacks,
  type InputState,
  type InputController,
  type OnBeforeProcessKeyDown,
} from './types/chat-input/input-native-callbacks';
