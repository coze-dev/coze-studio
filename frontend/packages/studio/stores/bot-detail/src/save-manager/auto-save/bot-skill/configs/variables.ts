import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';
import { CustomError } from '@coze-arch/bot-error';

import { uniqMemoryList } from '@/utils/uniq-memory-list';
import { type VariableItem, VariableKeyErrType } from '@/types/skill';
import { usePageRuntimeStore } from '@/store/page-runtime';
import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterVariables = HostedObserverConfig<
  BotSkillStore,
  ItemType,
  VariableItem[]
>;

export const variablesConfig: RegisterVariables = {
  key: ItemType.PROFILEMEMORY,
  selector: store => store.variables,
  debounce: DebounceTime.Immediate,
  middleware: {
    onBeforeSave: dataSource => {
      const { editable } = usePageRuntimeStore.getState();

      const filteredVariables = uniqMemoryList(dataSource).filter(i => {
        const errType = i?.errType || VariableKeyErrType.KEY_CHECK_PASS;

        return errType > VariableKeyErrType.KEY_CHECK_PASS;
      });

      if (!filteredVariables.length && editable) {
        return {
          variable_list: useBotSkillStore
            .getState()
            .transformVo2Dto.variables(dataSource),
        };
      }
      throw new CustomError(
        ReportEventNames.parmasValidation,
        'botSkill.variables return nothing',
      );
    },
  },
};
