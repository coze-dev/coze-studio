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

import { useParams } from 'react-router-dom';

import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';

export const useSendTeaEventForMemoryDebug = (p: { isStore: boolean }) => {
  const { isStore = false } = p;
  // TODO@XML seems to be used in the store too, don't change it
  const params = useParams<DynamicParams>();
  const { bot_id = '', product_id = '' } = params;

  const resourceTypeMaps = {
    longTimeMemory: 'long_term_memory',
    database: 'database',
    variable: 'variable',
    filebox: 'filebox',
  };

  return (type: string, extraParams: Record<string, unknown> = {}) => {
    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      bot_id: isStore ? product_id : bot_id,
      product_id: isStore ? product_id : '',
      resource_type: resourceTypeMaps[type || ''],
      action: 'turn_on',
      source: isStore ? 'store_detail_page' : 'bot_detail_page',
      source_detail: 'memory_preview',
      ...extraParams,
    });
  };
};
