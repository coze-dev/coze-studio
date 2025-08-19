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

export { SDKErrorCode, ChatSdkError } from '../util/error';
export {
  Layout,
  type CozeChatConfig,
  type IframeParams,
  type ComponentProps,
  type AuthProps,
  type UiProps,
  WebSdkError,
  IframeMessageEvent,
  AuthType,
  ChatType,
  type AppInfo,
  type BotInfo,
} from '../types/client';
export { PostMessageEvent, type PostMessage } from '../types/post';
export { Language } from '../types/i18n';

export { type ImagePreview, type OnImageClick } from '../types';
export { OpenApiSource } from '../types/open';
export { type OpenUserInfo } from '../types/user';
export type { ContentType } from '@coze-common/chat-core';
