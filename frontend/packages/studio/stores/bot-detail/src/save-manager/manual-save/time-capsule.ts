import { useBotSkillStore } from '@/store/bot-skill';

import { saveFetcher, updateBotRequest } from '../utils/save-fetcher';
import { ItemTypeExtra } from '../types';

export async function saveTimeCapsule() {
  const { timeCapsule, transformVo2Dto } = useBotSkillStore.getState();

  return await saveFetcher(
    () =>
      updateBotRequest({
        bot_tag_info: transformVo2Dto.timeCapsule({
          time_capsule_mode: timeCapsule.time_capsule_mode,
          disable_prompt_calling: timeCapsule.disable_prompt_calling,
          time_capsule_time_to_live: timeCapsule.time_capsule_time_to_live,
        }),
      }),
    ItemTypeExtra.TimeCapsule,
  );
}
