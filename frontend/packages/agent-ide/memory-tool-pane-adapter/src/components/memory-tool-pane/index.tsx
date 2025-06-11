import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { MemoryToolPane as BaseComponent } from '@coze-agent-ide/space-bot/component';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozVariables,
  IconCozDatabase,
} from '@coze/coze-design/icons';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import {
  DatabaseDebug,
  VariableDebug,
  type MemoryDebugDropdownMenuItem,
  MemoryModule,
} from '@coze-data/database';

interface EnhancedMemoryDebugDropdownMenuItem
  extends MemoryDebugDropdownMenuItem {
  isEnabled: boolean;
}

export const MemoryToolPane: React.FC = () => {
  const { databaseList, variables } = useBotSkillStore(
    useShallow(detail => ({
      databaseList: detail.databaseList,
      variables: detail.variables,
    })),
  );
  const pageFrom = usePageRuntimeStore(detail => detail.pageFrom);
  const isFromStore = pageFrom === BotPageFromEnum.Store;
  const menuList: MemoryDebugDropdownMenuItem[] = useMemo(() => {
    const list: EnhancedMemoryDebugDropdownMenuItem[] = [
      /**
       * 变量
       */
      {
        icon: <IconCozVariables />,
        label: I18n.t('variable_name'),
        name: MemoryModule.Variable,
        component: <VariableDebug />,
        isEnabled: Boolean(variables.length && !isFromStore),
      },
      /**
       * 已存数据库
       */
      {
        icon: <IconCozDatabase />,
        label: I18n.t('db_table_data_entry'),
        name: MemoryModule.Database,
        component: <DatabaseDebug />,
        isEnabled: Boolean(databaseList.length && !isFromStore),
      },
    ];

    return list.filter(item => item.isEnabled);
  }, [variables.length, isFromStore, databaseList.length]);
  return <BaseComponent menuList={menuList} />;
};
