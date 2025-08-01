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

import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { MemoryToolPane as BaseComponent } from '@coze-agent-ide/space-bot/component';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozVariables,
  IconCozDatabase,
} from '@coze-arch/coze-design/icons';
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
       * variable
       */
      {
        icon: <IconCozVariables />,
        label: I18n.t('variable_name'),
        name: MemoryModule.Variable,
        component: <VariableDebug />,
        isEnabled: Boolean(variables.length && !isFromStore),
      },
      /**
       * stored database
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
