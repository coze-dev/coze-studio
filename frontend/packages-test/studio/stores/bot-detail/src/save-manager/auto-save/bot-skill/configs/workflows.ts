import { cloneDeep, uniqBy } from 'lodash-es';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import type { WorkFlowItemType } from '@/types/skill';
import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterWorkflows = HostedObserverConfig<
  BotSkillStore,
  ItemType,
  WorkFlowItemType[]
>;

export const workflowsConfig: RegisterWorkflows = {
  key: ItemType.WORKFLOW,
  selector: store => store.workflows,
  debounce: DebounceTime.Immediate,
  middleware: {
    onBeforeSave: (dataSource: WorkFlowItemType[]) => {
      const workflowsToBackend = cloneDeep(dataSource);

      const filterList = uniqBy(workflowsToBackend, 'workflow_id').map(v => {
        // 解决加载图标的时候由于图标链接失效而报错，不在这里保存会失效的workflow的plugin_icon，而是每次都拉取最新的有效的图标链接
        v.plugin_icon = '';
        return v;
      });
      return {
        workflow_info_list: useBotSkillStore
          .getState()
          .transformVo2Dto.workflow(filterList),
      };
    },
  },
};
