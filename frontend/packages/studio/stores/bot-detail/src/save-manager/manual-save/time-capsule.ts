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
