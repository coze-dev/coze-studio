import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterTaskInfo = HostedObserverConfig<BotSkillStore, ItemType, boolean>;

export const taskInfoConfig: RegisterTaskInfo = {
  key: ItemType.TASK,
  selector: store => store.taskInfo.user_task_allowed,
  debounce: DebounceTime.Immediate,
  middleware: {
    onBeforeSave: dataSource => ({
      task_info: useBotSkillStore.getState().transformVo2Dto.task({
        user_task_allowed: dataSource,
      }),
    }),
  },
};
