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

import ChatCore from './chat-sdk';
export { TokenManager } from './credential';
export {
  UploadPluginConstructor,
  UploadEventName,
  UploadResult,
  BaseEventInfo,
  CompleteEventInfo,
  ProgressEventInfo,
  EventPayloadMaps,
  UploadPluginInterface,
} from './plugins/upload-plugin/types/plugin-upload';
export {
  type MsgParticipantType,
  type ParticipantInfo,
  GetHistoryMessageResponse,
} from './message/types/message-manager';
export type {
  CreateProps as CreateChatCoreProps,
  SdkMessageEvent,
  SdkPullingStatusEvent,
  SdkErrorEvent,
} from './chat-sdk/types/interface';
export { SdkEventsEnum } from './chat-sdk/types/interface';

export default ChatCore;
export { ChatCore };

export {
  Message,
  ContentType,
  VerboseContent,
  VerboseMsgType,
  AnswerFinishVerboseData,
  FinishReasonType,
  type MessageContent,
  type TextMixItem,
  type TextAndFileMixMessagePropsFilePayload,
  type TextAndFileMixMessagePropsImagePayload,
  type ImageModel,
  type ImageMixItem,
  type FileModel,
  type FileMixItem,
  messageSource,
  type MessageSource,
  type SendMessageOptions,
  type NormalizedMessageProps,
  type NormalizedMessagePropsPayload,
  type MessageMentionListFields,
  type TextAndFileMixMessageProps,
  type TextMessageProps,
  taskType,
  ChatMessageMetaType,
  type ChatMessageMetaInfo,
  type InterruptToolCallsType,
} from './message/types';
export { ChatCoreError } from './custom-error';
export {
  MessageFeedbackDetailType,
  MessageFeedbackType,
  ReportMessageAction,
  type ReportMessageProps,
  type ClearMessageContextParams,
  type ClearMessageContextProps,
} from './message/types/message-manager';

export { ChatCoreUploadPlugin } from './plugins/upload-plugin';
export {
  RequestScene,
  type RequestManagerOptions,
  type SceneConfig,
} from './request-manager/types';

export { ApiError } from './request-manager/api-error';

export {
  Scene,
  CreateProps,
  PresetBot,
  LoadDirection,
  PluginKey,
} from './chat-sdk/types/interface';
export { getFileInfo } from './shared/const';
export { FILE_TYPE_CONFIG, FileTypeEnum } from './shared/const';

export { type FileType } from './plugins/upload-plugin/types/plugin-upload';

export { getSlardarEnv } from './shared/utils/env';

export {
  type ImageMessageContent,
  type FileMessageContent,
  type MixMessageContent,
} from './message/types';
export { TFileTypeConfig } from './shared/const';

export { MessageType } from './message/types';

export { Biz } from './chat-sdk/types/interface';
export { ParsedEvent } from './channel/http-chunk/types';
