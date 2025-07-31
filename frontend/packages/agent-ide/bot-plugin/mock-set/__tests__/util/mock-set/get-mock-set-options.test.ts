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

import { describe, expect, it, vi } from 'vitest';

import { getMockSetReqOptions } from '../../../src/util/get-mock-set-options';

vi.mock('@coze-arch/bot-flags', () => ({
  getFlags: vi
    .fn()
    .mockReturnValueOnce({
      'bot.devops.plugin_mockset': true,
    })
    .mockReturnValueOnce({
      'bot.devops.plugin_mockset': false,
    }),
}));

const baseBotInfo = {
  mode: 0,
  botId: 'testBotId',
  botMarketStatus: 1,
  space_id: 'testSpaceId',
};

describe('getMockSetReqOptions', () => {
  it('should return mock headers when plugin_mockset flag is true', () => {
    const result = getMockSetReqOptions(baseBotInfo);

    expect(result).toEqual({
      headers: {
        'rpc-persist-mock-traffic-scene': 10000,
        'rpc-persist-mock-traffic-caller-id': 'testBotId',
        'rpc-persist-mock-space-id': 'testSpaceId',
        'rpc-persist-mock-traffic-enable': 1,
      },
    });
  });

  it('should return empty object when plugin_mockset flag is false', () => {
    const result = getMockSetReqOptions(baseBotInfo);

    expect(result).toEqual({});
  });
});
