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

import { type ContentType, type Message } from '@coze-common/chat-core';
export { type ImageMessageContent } from '@coze-common/chat-core';
export { type OnboardingSuggestionItem } from '@coze-common/chat-area';

export interface ImagePreview {
  visible: boolean;
  url: string;
}
export type OnImageClick = (extra: { url: string }) => void;

export type CoreMessage = Message<ContentType>;

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export enum MessageType {
  Answer = 'answer',
  Verbose = 'verbose',
}
