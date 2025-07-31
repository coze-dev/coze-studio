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

import { type Reporter } from '@coze-arch/logger';
import { type ChatMessage } from '@coze-arch/bot-api/developer_api';

import { getShouldDropMessage } from '../ignore-message';
import { type IgnoreMessageType } from '../../context/chat-area-context/type';
import { fixMessageStruct, markHistoryMessage } from './fix-message-struct';

export const fixHistoryMessageList = ({
  historyMessageList,
  ignoreMessageConfigList,
  reporter,
}: {
  historyMessageList: ChatMessage[];
  ignoreMessageConfigList: IgnoreMessageType[];
  reporter: Reporter;
}) =>
  historyMessageList
    .map(msg => fixMessageStruct(msg, reporter))
    .filter(msg => !getShouldDropMessage(ignoreMessageConfigList, msg))
    .map(markHistoryMessage);
