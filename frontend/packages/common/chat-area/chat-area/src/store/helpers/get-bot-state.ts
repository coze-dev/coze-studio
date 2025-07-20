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
 
import { type MessageExtraInfoBotState } from '../types';
import { safeJSONParse } from '../../utils/safe-json-parse';

// botState 中的成员都是 optional 保证形状为 {} 即可
const isBotState = (value: unknown): value is MessageExtraInfoBotState =>
  typeof value === 'object' && value !== null;

// todo 应该注释一下这个方法跟 stores/socket 下 getMessageBotStateFromStringifyObject 的区别
export const getBotState = (
  stringifyBotState?: string,
): MessageExtraInfoBotState => {
  const result = safeJSONParse(stringifyBotState);
  if (isBotState(result)) {
    return result;
  }
  return {};
};
