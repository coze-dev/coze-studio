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

import { type Message } from '../types';
import { getIsTriggerMessage } from '../../utils/message';
import { type MemberSetType } from '../../plugin/types/plugin-class/message-life-cycle';

export interface GetDefaultDistributeMemberSetTypePrams {
  message: Message;
}

export const getDefaultDistributeMemberSetType: (
  params: GetDefaultDistributeMemberSetTypePrams,
) => MemberSetType = ({ message }) => {
  if (message.role === 'user') {
    return 'user';
  }

  if (message.type === 'answer' || getIsTriggerMessage(message)) {
    return 'llm';
  } else if (message.type === 'follow_up') {
    return 'follow_up';
  } else {
    return 'function_call';
  }
};
