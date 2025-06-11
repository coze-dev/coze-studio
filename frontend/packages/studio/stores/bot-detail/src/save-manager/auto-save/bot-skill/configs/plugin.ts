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
      // 必须先深克隆，处理原数据会改动 store 的值
      const clonePluginApis = cloneDeep(dataSource);

      const newPluginApis = clonePluginApis.map(item => {
        // ai生成动画仅生效一次，请求接口时删除
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
