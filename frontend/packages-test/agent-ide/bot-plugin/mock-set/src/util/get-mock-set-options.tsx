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
