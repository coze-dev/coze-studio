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
