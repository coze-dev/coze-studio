import get from 'lodash-es/get';
import { TimeCapsuleMode } from '@coze-arch/idl/playground_api';

import { useBotInfo } from './use-bot-info';

export const useLTMInfo = (botId?: string) => {
  const { isLoading, botInfo } = useBotInfo(botId);
  const timeCapsuleMode = get(
    botInfo,
    ['bot_info', 'bot_tag_info', 'time_capsule_info', 'time_capsule_mode'],
    TimeCapsuleMode.Off,
  );

  return {
    // 是否开启长期记忆
    ltmEnabled: timeCapsuleMode === TimeCapsuleMode.On,
    isLoading,
  };
};
