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
        // Solve the problem of loading the icon due to the failure of the icon link and report an error. Do not save the plugin_icon of the invalid workflow here, but pull the latest valid icon link every time.
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
