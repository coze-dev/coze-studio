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

import { nanoid } from 'nanoid';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  type TableMemoryItem,
  type DatabaseList,
} from '@coze-studio/bot-detail-store';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import {
  type GetBotTableResponse,
  TableType,
  type BotTableRWMode,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { dataReporter, DataNamespace } from '@coze-data/reporter';

export const reloadDatabaseList = async () => {
  const { updateSkillDatabaseList } = useBotSkillStore.getState();
  const { botId } = useBotInfoStore.getState();

  let listTableRes: GetBotTableResponse | undefined;
  try {
    listTableRes = await MemoryApi.GetBotDatabase({
      bot_id: botId,
      table_type: TableType.DraftTable,
    });
  } catch (error) {
    dataReporter.errorEvent(DataNamespace.DATABASE, {
      eventName: REPORT_EVENTS.DatabaseListTable,
      error,
    });
  }
  if (listTableRes?.BotTableList && Array.isArray(listTableRes?.BotTableList)) {
    const newDatabaseInfo: DatabaseList = listTableRes.BotTableList.map(
      info => ({
        tableId: info.table_id as string,
        name: info.table_name as string,
        desc: info.table_desc as string,
        extra_info: info?.extra_info ?? {},
        readAndWriteMode: info.rw_mode as BotTableRWMode,
        tableMemoryList: (info.field_list as TableMemoryItem[])?.map(i => ({
          ...i,
          nanoid: nanoid(),
        })),
      }),
    );

    updateSkillDatabaseList(newDatabaseInfo);
  }
};
