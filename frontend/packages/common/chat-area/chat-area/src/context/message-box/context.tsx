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
 
import { createContext } from 'react';

import { type MessageMeta, type Message } from '../../store/types';

// TODO 可以再优化
export interface MessageBoxContextProviderProps {
  messageUniqKey: string;
  groupId: string;
  message: Message | undefined;
  meta: MessageMeta | undefined;
  regenerateMessage: () => Promise<void>;
  isFirstUserOrFinalAnswerMessage: boolean;
  isLastUserOrFinalAnswerMessage: boolean;
  functionCallMessageIdList?: string[];
  /** 这条消息属于的 group 是否正在进行对话 */
  isGroupChatActive: boolean;
}

export const MessageBoxContext = createContext<MessageBoxContextProviderProps>({
  messageUniqKey: '',
  groupId: '',
  regenerateMessage: () => Promise.resolve(),
  isFirstUserOrFinalAnswerMessage: false,
  isLastUserOrFinalAnswerMessage: false,
  message: undefined,
  meta: undefined,
  isGroupChatActive: false,
});
