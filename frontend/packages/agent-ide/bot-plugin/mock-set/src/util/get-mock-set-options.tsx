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

import { type BotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { getFlags } from '@coze-arch/bot-flags';
import { BotMode } from '@coze-arch/bot-api/developer_api';
import { TrafficScene } from '@coze-arch/bot-api/debugger_api';

export enum MockTrafficEnabled {
  DISABLE = 0,
  ENABLE = 1,
}

export function getMockSetReqOptions(baseBotInfo: BotInfoStore) {
  const FLAGS = getFlags();

  return FLAGS['bot.devops.plugin_mockset']
    ? {
        headers: {
          'rpc-persist-mock-traffic-scene':
            baseBotInfo.mode === BotMode.MultiMode
              ? TrafficScene.CozeMultiAgentDebug
              : TrafficScene.CozeSingleAgentDebug,
          'rpc-persist-mock-traffic-caller-id': baseBotInfo.botId,
          'rpc-persist-mock-space-id': baseBotInfo?.space_id,
          'rpc-persist-mock-traffic-enable': MockTrafficEnabled.ENABLE,
        },
      }
    : {};
}
