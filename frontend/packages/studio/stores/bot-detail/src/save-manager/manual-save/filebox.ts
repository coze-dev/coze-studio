import {
  type FileboxInfoMode,
  ItemType,
} from '@coze-arch/bot-api/developer_api';

import { useBotSkillStore } from '@/store/bot-skill';

import { saveFetcher, updateBotRequest } from '../utils/save-fetcher';

export const saveFileboxMode = async (nextMode: FileboxInfoMode) => {
  const { filebox: fileboxConfig } = useBotSkillStore.getState();

  return await saveFetcher(
    () =>
      updateBotRequest({
        filebox_info: useBotSkillStore
          .getState()
          .transformVo2Dto.filebox(
            fileboxConfig?.mode ? fileboxConfig : { mode: nextMode },
          ),
      }),

    ItemType.TABLE,
  );
};
