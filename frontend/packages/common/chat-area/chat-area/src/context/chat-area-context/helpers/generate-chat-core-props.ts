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

import { Scene } from '@coze-common/chat-core';
import type ChatCore from '@coze-common/chat-core';

import { type ChatAreaProviderProps } from '../type';

export const generateChatCoreBiz = (
  params: ChatAreaProviderProps['scene'],
): ChatCore['biz'] => {
  switch (params) {
    case Scene.CozeHome:
      return 'coze_home';
    case Scene.Playground:
      return 'bot_editor';
    // There is no bot store now
    default:
      return 'third_part';
  }
};
