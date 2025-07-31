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

import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import {
  type SendMessageOptions,
  type TextAndFileMixMessageProps,
  type TextMessageProps,
} from '@coze-common/chat-core';

export interface ChatShortCutBarProps {
  shortcuts: ShortCutCommand[]; // Currently supports two shortcuts
  onClickShortCut: (shortcutInfo: ShortCutCommand) => void;
}
// After the update, the home is white debugging area and the store is grey.
export type UIMode = 'grey' | 'white' | 'blur'; // The default is white, and it is blurred when there is a background.

export interface OnBeforeSendTemplateShortcutParams {
  message: TextAndFileMixMessageProps;
  options?: SendMessageOptions;
}

export interface OnBeforeSendQueryShortcutParams {
  message: TextMessageProps;
  options?: SendMessageOptions;
}
