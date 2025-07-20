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
  shortcuts: ShortCutCommand[]; // 目前支持两种快捷键
  onClickShortCut: (shortcutInfo: ShortCutCommand) => void;
}
// 更新后 home 为 white 调试区、商店为 grey
export type UIMode = 'grey' | 'white' | 'blur'; // 默认为白色，有背景的时候为模糊

export interface OnBeforeSendTemplateShortcutParams {
  message: TextAndFileMixMessageProps;
  options?: SendMessageOptions;
}

export interface OnBeforeSendQueryShortcutParams {
  message: TextMessageProps;
  options?: SendMessageOptions;
}
