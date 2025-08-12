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

import { cloneDeep } from 'lodash-es';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import type { EnabledPluginApi } from '@/types/skill';
import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterSystemContent = HostedObserverConfig<
  BotSkillStore,
  ItemType,
  EnabledPluginApi[]
>;

export const pluginConfig: RegisterSystemContent = {
  key: ItemType.APIINFO,
  selector: store => store.pluginApis,
  debounce: DebounceTime.Immediate,
  middleware: {
    onBeforeSave: dataSource => {
      // You must clone deeply first. Processing the original data will change the value of the store.
      const clonePluginApis = cloneDeep(dataSource);

      const newPluginApis = clonePluginApis.map(item => {
        // AI generated animation only takes effect once, deleted when requesting an interface
        delete item.autoAddCss;
        return item;
      });
      return {
        plugin_info_list: useBotSkillStore
          .getState()
          .transformVo2Dto.plugin(newPluginApis),
      };
    },
  },
};
