import { ItemType } from '@coze-arch/bot-api/developer_api';

import { useBotSkillStore } from '@/store/bot-skill';

import { saveFetcher, updateBotRequest } from '../utils/save-fetcher';

export async function saveTableMemory() {
  const { databaseList } = useBotSkillStore.getState();

  return await saveFetcher(
    () =>
      updateBotRequest({
        database_list: useBotSkillStore
          .getState()
          .transformVo2Dto.databaseList(databaseList),
      }),
    ItemType.TABLE,
  );
}
